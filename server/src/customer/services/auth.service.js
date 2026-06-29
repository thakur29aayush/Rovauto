const argon2 = require("argon2");
const crypto = require("crypto");
const prisma = require("../../config/prisma");
const { verifyFirebaseIdToken } = require("../../config/firebase");
const ApiError = require("../../utils/apiError");
const hashOtp = require("../../utils/hashOtp");
const { normalizePhone } = require("../../utils/phone");
const {
  createSignupOtp,
  createPhoneOtp,
  verifyPhoneOtp,
  verifySignupOtp,
  createResetPasswordOtp,
} = require("./otp.service");
const { createAuthToken } = require("./token.service");

const PENDING_SIGNUP_EXPIRY_MS = 15 * 60 * 1000;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  isOnboarded: user.isOnboarded,
});

const signup = async ({
  name,
  email,
  phone,
  password,
  confirmPassword,
  role = "CUSTOMER",
}) => {
  const cleanName = name?.trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  const validRoles = ["CUSTOMER", "GARAGE_OWNER"];
  const userRole = validRoles.includes(role) ? role : "CUSTOMER";

  if (!cleanName || !cleanEmail || !cleanPhone || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new ApiError(400, PASSWORD_MESSAGE);
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  await prisma.pendingSignup.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  });

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: cleanEmail }, { phone: cleanPhone }],
    },
  });

  if (existingUser) {
    throw new ApiError(
      409,
      existingUser.email === cleanEmail
        ? "User with this email already exists"
        : "User with this phone already exists"
    );
  }

  const conflictingPendingSignup = await prisma.pendingSignup.findFirst({
    where: {
      OR: [{ email: cleanEmail }, { phone: cleanPhone }],
      NOT: {
        AND: [{ email: cleanEmail }, { phone: cleanPhone }],
      },
    },
  });

  if (conflictingPendingSignup) {
    throw new ApiError(409, "Email or phone is already pending verification");
  }

  const hashedPassword = await argon2.hash(password);

  const pendingSignup = await prisma.pendingSignup.upsert({
    where: { email: cleanEmail },
    update: {
      name: cleanName,
      phone: cleanPhone,
      passwordHash: hashedPassword,
      role: userRole,
      isEmailVerified: false,
      isPhoneVerified: false,
      expiresAt: new Date(Date.now() + PENDING_SIGNUP_EXPIRY_MS),
    },
    create: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: hashedPassword,
      role: userRole,
      expiresAt: new Date(Date.now() + PENDING_SIGNUP_EXPIRY_MS),
    },
  });

  try {
    await createSignupOtp({
      email: pendingSignup.email,
    });
  } catch (error) {
    await prisma.$transaction([
      prisma.emailOtp.deleteMany({
        where: { email: pendingSignup.email },
      }),
      prisma.phoneOtp.deleteMany({
        where: { phone: pendingSignup.phone },
      }),
      prisma.pendingSignup.deleteMany({
        where: { id: pendingSignup.id },
      }),
    ]);

    throw error;
  }

  return {
    email: pendingSignup.email,
    phone: pendingSignup.phone,
    message: "OTP sent to email.",
  };
};

const verifyOtp = async ({ email, phone, otp }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  const pendingSignup = await prisma.pendingSignup.findFirst({
    where: {
      email: cleanEmail,
      phone: cleanPhone,
    },
  });

  if (!pendingSignup || pendingSignup.expiresAt <= new Date()) {
    if (pendingSignup) {
      await prisma.pendingSignup.delete({ where: { id: pendingSignup.id } });
    }
    throw new ApiError(400, "Signup verification expired. Please register again.");
  }

  await verifySignupOtp({
    email: cleanEmail,
    otp,
  });

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: pendingSignup.name,
        email: pendingSignup.email,
        phone: pendingSignup.phone,
        password: pendingSignup.passwordHash,
        role: pendingSignup.role,
        isEmailVerified: true,
        isPhoneVerified: false,
        ...(pendingSignup.role === "CUSTOMER" && {
          customerProfile: { create: {} },
        }),
      },
    });

    await tx.pendingSignup.delete({
      where: { id: pendingSignup.id },
    });

    return createdUser;
  });

  const safeUser = toSafeUser(user);
  const token = createAuthToken(safeUser);

  return {
    user: safeUser,
    token,
  };
};

const resendOtp = async ({ email, phone }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  const pendingSignup = await prisma.pendingSignup.findFirst({
    where: {
      email: cleanEmail,
      phone: cleanPhone,
    },
  });

  if (!pendingSignup || pendingSignup.expiresAt <= new Date()) {
    throw new ApiError(400, "Signup verification expired. Please register again.");
  }

  await createSignupOtp({
    email: pendingSignup.email,
  });

  return {
    message: "OTP resent successfully",
  };
};

const sendPhoneOtp = async ({ phone }) => {
  const cleanPhone = normalizePhone(phone);

  await createPhoneOtp({
    phone: cleanPhone,
    otp: require("../../utils/generateOtp")(),
  });

  return {
    phone: cleanPhone,
    message: "OTP sent successfully",
  };
};

const verifyPhoneNumberOtp = async ({ phone, otp }, userId = null) => {
  const cleanPhone = normalizePhone(phone);

  await verifyPhoneOtp({
    phone: cleanPhone,
    otp,
  });

  if (userId) {
    await prisma.user.updateMany({
      where: {
        id: userId,
        phone: cleanPhone,
      },
      data: {
        isPhoneVerified: true,
      },
    });
  } else {
    await prisma.user.updateMany({
      where: {
        phone: cleanPhone,
      },
      data: {
        isPhoneVerified: true,
      },
    });
  }

  return {
    phone: cleanPhone,
    verified: true,
  };
};

const login = async ({ identifier, password }) => {
  const rawIdentifier = identifier?.trim();
  const cleanIdentifier = rawIdentifier?.startsWith("+")
    ? normalizePhone(rawIdentifier)
    : normalizeEmail(rawIdentifier);

  if (!cleanIdentifier || !password) {
    throw new ApiError(400, "Email/phone and password are required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: cleanIdentifier }, { phone: cleanIdentifier }],
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before login");
  }

  const safeUser = toSafeUser(user);
  const token = createAuthToken(safeUser);

  return {
    user: safeUser,
    token,
  };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isOnboarded: true,
      isActive: true,
      customerProfile: true,
      vehicles: true,
      locations: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const googleAuth = async ({ idToken, role = "CUSTOMER" }) => {
  const decodedToken = await verifyFirebaseIdToken(idToken);
  const cleanEmail = normalizeEmail(decodedToken.email);
  const cleanName =
    decodedToken.name?.trim() ||
    decodedToken.email?.split("@")[0] ||
    "Rovauto User";
  const validRoles = ["CUSTOMER", "GARAGE_OWNER"];
  const userRole = validRoles.includes(role) ? role : "CUSTOMER";

  if (!cleanEmail || !decodedToken.email_verified) {
    throw new ApiError(400, "Google account email must be verified");
  }

  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (user) {
    if (!user.isActive) {
      throw new ApiError(403, "Account is disabled");
    }

    if (!user.isEmailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }
  } else {
    const randomPassword = await argon2.hash(crypto.randomBytes(32).toString("hex"));

    user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: randomPassword,
        role: userRole,
        isEmailVerified: true,
        isPhoneVerified: false,
        ...(userRole === "CUSTOMER" && {
          customerProfile: { create: {} },
        }),
      },
    });

    await prisma.pendingSignup.deleteMany({
      where: { email: cleanEmail },
    });
    await prisma.emailOtp.deleteMany({
      where: { email: cleanEmail },
    });
  }

  const safeUser = toSafeUser(user);
  const token = createAuthToken(safeUser);

  return {
    user: safeUser,
    token,
  };
};

const forgotPassword = async ({ email }) => {
  const cleanEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  await createResetPasswordOtp(user.id, user.email);

  return {
    message: "Password reset OTP sent successfully",
  };
};

const resetPassword = async ({ email, otp, newPassword }) => {
  const cleanEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpHash = hashOtp(otp);

  const validOtp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      otpHash,
      purpose: "RESET_PASSWORD",
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!validOtp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashedPassword = await argon2.hash(newPassword);

  await prisma.$transaction([
    prisma.otp.update({
      where: { id: validOtp.id },
      data: { usedAt: new Date() },
    }),

    prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    }),
  ]);

  return {
    message: "Password reset successful",
  };
};

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  sendPhoneOtp,
  verifyPhoneNumberOtp,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
};
