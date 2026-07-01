const { Resend } = require("resend");

const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const generateOtp = require("../../utils/generateOtp");
const hashOtp = require("../../utils/hashOtp");
const { normalizePhone } = require("../../utils/phone");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const assertOtpCooldown = (latestOtp) => {
  if (!latestOtp) return;

  const resendAt = latestOtp.createdAt.getTime() + OTP_RESEND_COOLDOWN_MS;

  if (Date.now() < resendAt) {
    const waitSeconds = Math.ceil((resendAt - Date.now()) / 1000);
    throw new ApiError(429, `Please wait ${waitSeconds}s before requesting another OTP`);
  }
};

const sendEmailOtp = async ({ to, otp, subject = "Rovauto verification OTP" }) => {
  const html = `
      <h2>Verify your Rovauto account</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    `;

  if (process.env.EMAIL_OTP_DELIVERY !== "email" || !resend || !process.env.EMAIL_FROM) {
    console.log("=================================");
    console.log("ROVAUTO EMAIL OTP PREVIEW");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("OTP:", otp);
    console.log("HTML:", html.trim());
    console.log("=================================");
    return true;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  return true;
};

const createEmailOtp = async ({ email, otp, skipCooldown = false }) => {
  const cleanEmail = normalizeEmail(email);
  const latestOtp = await prisma.emailOtp.findFirst({
    where: { email: cleanEmail },
    orderBy: { createdAt: "desc" },
  });

  if (!skipCooldown) {
    assertOtpCooldown(latestOtp);
  }

  await prisma.emailOtp.deleteMany({
    where: { email: cleanEmail },
  });

  await prisma.emailOtp.create({
    data: {
      email: cleanEmail,
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });

  await sendEmailOtp({ to: cleanEmail, otp });

  return cleanEmail;
};

const createPhoneOtp = async ({ phone, otp, skipCooldown = false }) => {
  throw new ApiError(503, "SMS OTP is temporarily disabled");
};

const createSignupOtp = async ({ email, skipCooldown = false }) => {
  const otp = generateOtp();
  const cleanEmail = await createEmailOtp({ email, otp, skipCooldown });

  return {
    email: cleanEmail,
  };
};

const verifyStoredOtp = async ({ model, identifierField, identifier, otp }) => {
  const submittedOtp = String(otp || "").trim();

  if (!/^\d{6}$/.test(submittedOtp)) {
    throw new ApiError(400, "OTP must be 6 digits");
  }

  const record = await prisma[model].findFirst({
    where: {
      [identifierField]: identifier,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.expiresAt <= new Date()) {
    await prisma[model].delete({ where: { id: record.id } });
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma[model].delete({ where: { id: record.id } });
    throw new ApiError(429, "Maximum OTP verification attempts exceeded");
  }

  if (record.otpHash !== hashOtp(submittedOtp)) {
    await prisma[model].update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await prisma[model].delete({
    where: { id: record.id },
  });

  return true;
};

const verifyEmailOtp = async ({ email, otp }) => {
  return verifyStoredOtp({
    model: "emailOtp",
    identifierField: "email",
    identifier: normalizeEmail(email),
    otp,
  });
};

const verifyPhoneOtp = async ({ phone, otp }) => {
  return verifyStoredOtp({
    model: "phoneOtp",
    identifierField: "phone",
    identifier: normalizePhone(phone),
    otp,
  });
};

const getLatestOtpOrThrow = async ({ model, identifierField, identifier }) => {
  const record = await prisma[model].findFirst({
    where: {
      [identifierField]: identifier,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.expiresAt <= new Date()) {
    await prisma[model].delete({ where: { id: record.id } });
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma[model].delete({ where: { id: record.id } });
    throw new ApiError(429, "Maximum OTP verification attempts exceeded");
  }

  return record;
};

const verifySignupOtp = async ({ email, otp }) => {
  const cleanEmail = normalizeEmail(email);
  const submittedOtp = String(otp || "").trim();

  if (!/^\d{6}$/.test(submittedOtp)) {
    throw new ApiError(400, "OTP must be 6 digits");
  }

  const emailOtp = await getLatestOtpOrThrow({
    model: "emailOtp",
    identifierField: "email",
    identifier: cleanEmail,
  });

  const submittedHash = hashOtp(submittedOtp);

  if (emailOtp.otpHash !== submittedHash) {
    await prisma.emailOtp.update({
      where: { id: emailOtp.id },
      data: { attempts: { increment: 1 } },
    });

    throw new ApiError(400, "Invalid or expired OTP");
  }

  await prisma.emailOtp.delete({ where: { id: emailOtp.id } });

  return true;
};

const createResetPasswordOtp = async (userId, email) => {
  const otp = generateOtp();
  const cleanEmail = normalizeEmail(email);

  await prisma.otp.deleteMany({
    where: {
      userId,
      purpose: "RESET_PASSWORD",
      usedAt: null,
    },
  });

  await prisma.otp.create({
    data: {
      userId,
      otpHash: hashOtp(otp),
      purpose: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });

  await sendEmailOtp({
    to: cleanEmail,
    otp,
    subject: "Rovauto password reset OTP",
  });

  return true;
};

module.exports = {
  OTP_MAX_ATTEMPTS,
  createSignupOtp,
  createPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  verifySignupOtp,
  createResetPasswordOtp,
};
