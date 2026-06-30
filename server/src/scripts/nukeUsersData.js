require("dotenv/config");

const fs = require("fs");
const path = require("path");

const prisma = require("../config/prisma");

const args = process.argv.slice(2);

const hasFlag = (name) => args.includes(`--${name}`);

const getArg = (name) => {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : "";
};

const usage = () => {
  console.log(`
Usage:
  npm run db:nuke-users
  npm run db:nuke-users -- --confirm --i-understand-delete-all-users

Dry-run is the default. Confirmed runs first create a JSON backup, then delete users.
Garages and service catalog data are preserved. Garage owner links are cleared.

Optional:
  --backup-dir=./backups

Example:
  npm run db:nuke-users -- --confirm --i-understand-delete-all-users
`);
};

const getBackupDir = () => {
  const customDir = getArg("backup-dir");
  return customDir
    ? path.resolve(process.cwd(), customDir)
    : path.resolve(process.cwd(), "backups");
};

const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const collectCounts = async () => {
  const [
    users,
    customerProfiles,
    vehicles,
    bookings,
    payments,
    complaints,
    notifications,
    otps,
    reviews,
    wallets,
    walletTransactions,
    pendingSignups,
    emailOtps,
    phoneOtps,
    ownedGarageLinks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.customerProfile.count(),
    prisma.vehicle.count(),
    prisma.booking.count(),
    prisma.payment.count(),
    prisma.complaint.count(),
    prisma.notification.count({ where: { userId: { not: null } } }),
    prisma.otp.count(),
    prisma.review.count(),
    prisma.wallet.count(),
    prisma.walletTransaction.count(),
    prisma.pendingSignup.count(),
    prisma.emailOtp.count(),
    prisma.phoneOtp.count(),
    prisma.garage.count({ where: { ownerId: { not: null } } }),
  ]);

  return {
    users,
    customerProfiles,
    vehicles,
    bookings,
    payments,
    complaints,
    notifications,
    otps,
    reviews,
    wallets,
    walletTransactions,
    pendingSignups,
    emailOtps,
    phoneOtps,
    ownedGarageLinks,
  };
};

const collectBackup = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      customerProfile: true,
      vehicles: true,
      locations: true,
      bookings: {
        include: {
          services: true,
          payment: true,
          broadcasts: true,
          review: true,
        },
      },
      complaints: {
        include: { images: true },
      },
      notifications: true,
      otps: true,
      wallet: true,
      walletTransactions: true,
      reviews: true,
      ownedGarages: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          ownerId: true,
        },
      },
    },
  });

  const emails = users.map((user) => user.email).filter(Boolean);
  const phones = users.map((user) => user.phone).filter(Boolean);

  const [pendingSignups, emailOtps, phoneOtps] = await Promise.all([
    prisma.pendingSignup.findMany({
      where: {
        OR: [{ email: { in: emails } }, { phone: { in: phones } }],
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.emailOtp.findMany({
      where: { email: { in: emails } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.phoneOtp.findMany({
      where: { phone: { in: phones } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    note:
      "Backup created before db:nuke-users. Service catalog and garage records are not deleted by the script.",
    users,
    signupArtifacts: {
      pendingSignups,
      emailOtps,
      phoneOtps,
    },
  };
};

const writeBackup = async () => {
  const backup = await collectBackup();
  const backupDir = getBackupDir();
  fs.mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(backupDir, `users-backup-${getTimestamp()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

  return {
    backupPath,
    userCount: backup.users.length,
  };
};

const deleteAllUsersData = async () => {
  if (hasFlag("help")) {
    usage();
    return;
  }

  const confirm = hasFlag("confirm");
  const understand = hasFlag("i-understand-delete-all-users");
  const counts = await collectCounts();

  console.log("User data currently in database:");
  console.log(counts);
  console.log("\nPreserved tables: garages, garage media, garage services, services, categories, vehicle metadata.");

  if (!confirm || !understand) {
    console.log(
      "\nDry-run only. Re-run with --confirm --i-understand-delete-all-users to create a backup and delete all users."
    );
    return;
  }

  const { backupPath, userCount } = await writeBackup();
  console.log(`\nBackup saved: ${backupPath}`);

  if (userCount === 0) {
    console.log("No users found. Nothing to delete.");
    return;
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, phone: true },
  });
  const userIds = users.map((user) => user.id);
  const emails = users.map((user) => user.email).filter(Boolean);
  const phones = users.map((user) => user.phone).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.emailOtp.deleteMany({ where: { email: { in: emails } } });
    await tx.phoneOtp.deleteMany({ where: { phone: { in: phones } } });
    await tx.pendingSignup.deleteMany({
      where: {
        OR: [{ email: { in: emails } }, { phone: { in: phones } }],
      },
    });

    await tx.garage.updateMany({
      where: { ownerId: { in: userIds } },
      data: { ownerId: null },
    });

    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  });

  console.log(`Deleted ${userCount} user(s) and their user-linked data.`);
  console.log("Garages and service catalog data were preserved.");
};

deleteAllUsersData()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
