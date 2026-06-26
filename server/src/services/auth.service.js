const argon2 = require("argon2");
const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const hashOtp = require("../utils/hashOtp");
const {
  createSignupOtp,
  createResetPasswordOtp,
} = require("./otp.service");
const { createAuthToken } = require("./token.service");

const signup = async ({ name, email, phone, password }) => {
  const cleanName = name?.trim();
  const cleanEmail = email?.trim()?.toLowerCase();
  const cleanPhone = phone?.trim() || null;

  if (!cleanName || !cleanEmail || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const duplicateChecks = [{ email: cleanEmail }];

  if (cleanPhone) {
    duplicateChecks.push({ phone: cleanPhone });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: duplicateChecks,
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

  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      customerProfile: {
        create: {},
      },
    },
  });

  await createSignupOtp(user.id, user.email);

  return {
    userId: user.id,
    email: user.email,
    message: "Signup successful. OTP sent to email.",
  };
};

const verifyOtp = async ({ email, otp }) => {
  const cleanEmail = email?.trim()?.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  const otpHash = hashOtp(otp);

  const validOtp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      otpHash,
      purpose: "SIGNUP",
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

  await prisma.$transaction([
    prisma.otp.update({
      where: { id: validOtp.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    }),
  ]);

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isOnboarded: true,
    },
  });

  const token = createAuthToken(updatedUser);

  return {
    user: updatedUser,
    token,
  };
};

const resendOtp = async ({ email }) => {
  const cleanEmail = email?.trim()?.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  await createSignupOtp(user.id, user.email);

  return {
    message: "OTP resent successfully",
  };
};

const login = async ({ identifier, password }) => {
  const cleanIdentifier = identifier?.trim()?.toLowerCase();

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

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isOnboarded: user.isOnboarded,
  };

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

const forgotPassword = async ({ email }) => {
  const cleanEmail = email?.trim()?.toLowerCase();

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
  const cleanEmail = email?.trim()?.toLowerCase();

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
  login,
  getMe,
  forgotPassword,
  resetPassword,
};