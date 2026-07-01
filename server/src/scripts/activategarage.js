#!/usr/bin/env node
/**
 * Activate a garage (set isActive = true) from the terminal.
 *
 * Usage examples:
 *  node server/src/scripts/activateGarage.js --list
 *  node server/src/scripts/activateGarage.js --garage-id=<garage-id>
 *  node server/src/scripts/activateGarage.js --application-id=<application-id>
 *  node server/src/scripts/activateGarage.js --email=owner@example.com --confirm
 *  node server/src/scripts/activateGarage.js --phone=+919812345678 --confirm
 *  node server/src/scripts/activateGarage.js --garage-name="Garage Name" --confirm --note="Custom admin note"
 *
 * Dry-run is default. Add --confirm to perform activation/approval actions.
 */

const prisma = require("../config/prisma");
const applicationService = require("../garage/services/application.service");

const args = process.argv.slice(2);

const getArg = (name) => {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : "";
};

const hasFlag = (name) => args.includes(`--${name}`);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizePhone = (phone) => String(phone || "").trim();

const usage = () => {
  console.log(`
Usage:
  node server/src/scripts/activateGarage.js --list
  node server/src/scripts/activateGarage.js --garage-id=<garage-id> [--confirm]
  node server/src/scripts/activateGarage.js --application-id=<application-id> [--confirm]
  node server/src/scripts/activateGarage.js --email=owner@example.com [--confirm]
  node server/src/scripts/activateGarage.js --phone=+919812345678 [--confirm]
  node server/src/scripts/activateGarage.js --garage-name="Garage Name" [--confirm]

Dry-run is the default. Add --confirm to actually approve (if needed) and activate.
Use --note="custom admin note" to pass an admin note when approving an application.
`);
};

const printGarage = (g) => {
  console.log({
    id: g.id,
    name: g.name,
    email: g.email,
    phone: g.phone,
    isVerified: g.isVerified,
    isActive: g.isActive,
    applicationId: g.applicationId,
    createdAt: g.createdAt,
  });
};

const listPending = async () => {
  const inactiveGarages = await prisma.garage.findMany({
    where: { isActive: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const pendingApps = await prisma.garageApplication.findMany({
    where: { status: { in: ["PENDING", "CHANGES_REQUESTED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log(`Inactive garages (${inactiveGarages.length}):`);
  inactiveGarages.forEach(printGarage);

  console.log("\nPending/changes-requested applications:");
  pendingApps.forEach((a) =>
    console.log({
      id: a.id,
      ownerName: a.ownerName,
      email: a.email,
      phone: a.phone,
      garageName: a.garageName,
      status: a.status,
      createdAt: a.createdAt,
    })
  );
};

const buildWhereForGarage = ({ garageId, applicationId, email, phone, garageName }) => {
  if (garageId) return { id: garageId };
  if (applicationId) return { applicationId: applicationId };
  if (email) return { email: normalizeEmail(email) };
  if (phone) return { phone: normalizePhone(phone) };
  if (garageName) return { name: { equals: garageName, mode: "insensitive" } };
  return null;
};

const buildWhereForApplication = ({ applicationId, email, phone, garageName }) => {
  const OR = [];
  if (applicationId) OR.push({ id: applicationId });
  if (email) OR.push({ email: normalizeEmail(email) });
  if (phone) OR.push({ phone: normalizePhone(phone) });
  if (garageName) OR.push({ garageName: { equals: garageName, mode: "insensitive" } });
  return OR.length ? { OR } : null;
};

const activateGarageById = async (garageId) => {
  const g = await prisma.garage.findUnique({ where: { id: garageId } });
  if (!g) {
    console.error("Garage not found with id:", garageId);
    return null;
  }

  if (g.isActive) {
    console.log("Garage is already active:");
    printGarage(g);
    return g;
  }

  const updated = await prisma.garage.update({
    where: { id: garageId },
    data: { isActive: true },
  });

  console.log("Activated garage:");
  printGarage(updated);
  return updated;
};

const run = async () => {
  if (hasFlag("help")) {
    usage();
    return;
  }

  if (hasFlag("list")) {
    await listPending();
    return;
  }

  const garageId = getArg("garage-id");
  const applicationId = getArg("application-id");
  const email = getArg("email");
  const phone = getArg("phone");
  const garageName = getArg("garage-name");
  const note = getArg("note") || undefined;

  if (!garageId && !applicationId && !email && !phone && !garageName) {
    usage();
    return;
  }

  // Try to find a garage first
  const garageWhere = buildWhereForGarage({ garageId, applicationId, email, phone, garageName });
  let garage = garageWhere ? await prisma.garage.findFirst({ where: garageWhere }) : null;

  if (garage) {
    console.log("Found garage:");
    printGarage(garage);

    if (!hasFlag("confirm")) {
      console.log("\nDry-run: re-run with --confirm to activate this garage.");
      return;
    }

    await activateGarageById(garage.id);
    return;
  }

  // If no garage found, try to find an application
  const appWhere = buildWhereForApplication({ applicationId, email, phone, garageName });
  if (!appWhere) {
    console.error("No search criteria resolved to an application or garage.");
    return;
  }

  const applications = await prisma.garageApplication.findMany({
    where: {
      ...appWhere,
      status: { in: ["PENDING", "CHANGES_REQUESTED", "APPROVED"] },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!applications || applications.length === 0) {
    console.error("No matching garage application found for the provided identifier(s).");
    return;
  }

  if (applications.length > 1) {
    console.log(`Matched ${applications.length} applications. Re-run with --application-id=<id> to target exactly one.`);
    applications.forEach((a) =>
      console.log({
        id: a.id,
        ownerName: a.ownerName,
        email: a.email,
        phone: a.phone,
        garageName: a.garageName,
        status: a.status,
      })
    );
    return;
  }

  const application = applications[0];
  console.log("Matched application:");
  console.log({
    id: application.id,
    ownerName: application.ownerName,
    email: application.email,
    phone: application.phone,
    garageName: application.garageName,
    status: application.status,
    createdAt: application.createdAt,
  });

  if (!hasFlag("confirm")) {
    console.log("\nDry-run: re-run with --confirm to approve (if needed) and activate the garage.");
    return;
  }

  // If application is not APPROVED, call applicationService.approveApplication
  let result;
  if (application.status !== "APPROVED") {
    console.log("Approving application now...");
    result = await applicationService.approveApplication(application.id, note);
    console.log("Application approved. Result summary:");
    console.log({
      applicationId: result.application?.id,
      approvedGarageId: result.garage?.id || result.application?.approvedGarageId,
      ownerId: result.owner?.id,
      ownerEmail: result.owner?.email,
    });
  } else {
    // Already approved — try to fetch the garage using approvedGarageId or applicationId
    result = {
      application,
      garage: null,
      owner: null,
    };
    const g = await prisma.garage.findFirst({ where: { applicationId: application.id } });
    if (g) result.garage = g;
    const owner = await prisma.user.findUnique({ where: { email: application.email } });
    if (owner) result.owner = owner;
  }

  const garageIdToActivate = (result.garage && result.garage.id) || (result.application && result.application.approvedGarageId);

  if (!garageIdToActivate) {
    console.error("Could not determine garage id to activate after approval.");
    return;
  }

  // Activate garage
  await activateGarageById(garageIdToActivate);

  // Print resetOtp if available (dev/testing)
  if (result.resetOtp) {
    console.log(`Reset OTP for owner (${result.owner?.email || application.email}): ${result.resetOtp}`);
  }
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err && (err.message || err));
    process.exit(2);
  });