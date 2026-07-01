const argon2 = require("argon2");
const crypto = require("crypto");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const { sendGarageApplicationEmail } = require("./applicationEmail.service");
const { createResetPasswordOtp } = require("../../customer/services/otp.service");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizePhone = (phone) => String(phone || "").trim();

const applicationSelect = {
  id: true,
  ownerName: true,
  email: true,
  phone: true,
  garageName: true,
  description: true,
  address: true,
  city: true,
  area: true,
  latitude: true,
  longitude: true,
  status: true,
  adminNote: true,
  reviewedAt: true,
  approvedGarageId: true,
  createdAt: true,
  updatedAt: true,
};

const submitApplication = async (payload) => {
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);

  const existingOpenApplication = await prisma.garageApplication.findFirst({
    where: {
      OR: [{ email }, { phone }],
      status: { in: ["PENDING", "CHANGES_REQUESTED"] },
    },
  });

  if (existingOpenApplication) {
    throw new ApiError(409, "A garage application is already pending or awaiting changes for this email/phone");
  }

  return prisma.garageApplication.create({
    data: {
      ownerName: payload.ownerName.trim(),
      email,
      phone,
      garageName: payload.garageName.trim(),
      description: payload.description?.trim() || null,
      address: payload.address.trim(),
      city: payload.city.trim(),
      area: payload.area.trim(),
      latitude: payload.latitude === undefined ? null : Number(payload.latitude),
      longitude: payload.longitude === undefined ? null : Number(payload.longitude),
      status: "PENDING",
    },
    select: applicationSelect,
  });
};

const listApplications = async (query = {}) => {
  const { status = "PENDING" } = query;
  return prisma.garageApplication.findMany({
    where: status ? { status } : {},
    select: applicationSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getApplication = async (applicationId) => {
  const application = await prisma.garageApplication.findUnique({
    where: { id: applicationId },
    select: applicationSelect,
  });
  if (!application) throw new ApiError(404, "Garage application not found");
  return application;
};

const requestChanges = async (applicationId, adminNote) => {
  const application = await getApplication(applicationId);
  const updatedApplication = await prisma.garageApplication.update({
    where: { id: applicationId },
    data: {
      status: "CHANGES_REQUESTED",
      adminNote: adminNote || "Please update and resubmit your garage application.",
      reviewedAt: new Date(),
    },
    select: applicationSelect,
  });

  await sendGarageApplicationEmail({
    to: application.email,
    subject: "Rovauto garage application changes requested",
    message: updatedApplication.adminNote,
  });

  return updatedApplication;
};

const denyApplication = async (applicationId, adminNote) => {
  const application = await getApplication(applicationId);
  const updatedApplication = await prisma.garageApplication.update({
    where: { id: applicationId },
    data: {
      status: "DENIED",
      adminNote: adminNote || "Your garage application was not approved at this time.",
      reviewedAt: new Date(),
    },
    select: applicationSelect,
  });

  await sendGarageApplicationEmail({
    to: application.email,
    subject: "Rovauto garage application update",
    message: updatedApplication.adminNote,
  });

  return updatedApplication;
};

const approveApplication = async (applicationId, adminNote) => {
  const application = await getApplication(applicationId);
  if (application.status === "APPROVED" && application.approvedGarageId) {
    throw new ApiError(400, "Garage application is already approved");
  }

  const existingGarage = await prisma.garage.findFirst({
    where: {
      OR: [{ applicationId }, { email: application.email }, { phone: application.phone }],
    },
  });
  if (existingGarage) throw new ApiError(409, "A garage already exists for this application/email/phone");

  // perform owner creation/update, garage creation and update application in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const existingOwner = await tx.user.findUnique({ where: { email: application.email } });
    const owner = existingOwner
      ? await tx.user.update({
          where: { id: existingOwner.id },
          data: {
            name: application.ownerName,
            phone: application.phone,
            role: "GARAGE_OWNER",
            isActive: true,
            isEmailVerified: true,
          },
        })
      : await tx.user.create({
          data: {
            name: application.ownerName,
            email: application.email,
            phone: application.phone,
            password: await argon2.hash(crypto.randomBytes(32).toString("hex")),
            role: "GARAGE_OWNER",
            isActive: true,
            isEmailVerified: true,
          },
        });

    const garage = await tx.garage.create({
      data: {
        applicationId,
        ownerId: owner.id,
        name: application.garageName,
        description: application.description,
        phone: application.phone,
        whatsappNo: application.phone,
        email: application.email,
        address: application.address,
        city: application.city,
        area: application.area,
        latitude: application.latitude || 0,
        longitude: application.longitude || 0,
        isVerified: true,
        isActive: false,
        wallet: { create: { balance: 0 } },
      },
      include: { owner: true, wallet: true },
    });

    const updatedApplication = await tx.garageApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        adminNote: adminNote || "Garage approved. Recharge at least Rs. 1000 to activate listing.",
        reviewedAt: new Date(),
        approvedGarageId: garage.id,
      },
      select: applicationSelect,
    });

    return {
      application: updatedApplication,
      garage,
      owner,
      activationRequired: {
        minimumRecharge: 1000,
        message: "Garage is verified but inactive until wallet has at least Rs. 1000 verified Cashfree balance.",
      },
    };
  });

  // Generate a reset OTP for the owner so they can set a password.
  // createResetPasswordOtp returns plaintext OTP (dev/testing only) and also logs it.
  const resetOtp = await createResetPasswordOtp(result.owner.id, result.owner.email);

  // Send the approval email including the OTP (development/testing)
  const approvalMessage = `${result.application.adminNote}\n\nYour account has been created/verified.\n\nUse this OTP to set your password via Forgot Password -> Reset Password: ${resetOtp}\n\nIf you don't see an OTP, use 'Forgot Password' on login to receive one.`;

  await sendGarageApplicationEmail({
    to: result.owner.email,
    subject: "Rovauto garage application approved",
    message: approvalMessage,
  });

  // Include resetOtp in the returned result for admin API responses (dev/testing)
  return {
    ...result,
    resetOtp,
  };
};

module.exports = {
  approveApplication,
  denyApplication,
  getApplication,
  listApplications,
  requestChanges,
  submitApplication,
};