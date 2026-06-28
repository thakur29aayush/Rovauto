const { Resend } = require("resend");

const prisma = require("../../config/prisma");
const generateOtp = require("../../utils/generateOtp");
const hashOtp = require("../../utils/hashOtp");

const resend = new Resend(process.env.RESEND_API_KEY);

const createSignupOtp = async (userId, email) => {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  if (process.env.NODE_ENV === "development") {
    console.log("=================================");
    console.log("DEV OTP:", otp);
    console.log("Email:", email);
    console.log("=================================");
  }

  await prisma.otp.create({
    data: {
      userId,
      otpHash,
      purpose: "SIGNUP",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Project X Email Verification OTP",
    html: `
      <h2>Verify your Project X account</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
  });

  return true;
};

const createResetPasswordOtp = async (userId, email) => {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  if (process.env.NODE_ENV === "development") {
    console.log("=================================");
    console.log("RESET PASSWORD DEV OTP:", otp);
    console.log("Email:", email);
    console.log("=================================");
  }

  await prisma.otp.create({
    data: {
      userId,
      otpHash,
      purpose: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Project X Password Reset OTP",
    html: `
      <h2>Reset your Project X password</h2>
      <p>Your password reset OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
  });

  return true;
};

module.exports = {
  createSignupOtp,
  createResetPasswordOtp,
};
