require("dotenv/config");

const prisma = require("../config/prisma");

const args = process.argv.slice(2);

const getArg = (name) => {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : "";
};

const hasFlag = (name) => args.includes(`--${name}`);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizePhoneLoose = (phone) => {
  const raw = String(phone || "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : "";
};

const usage = () => {
  console.log(`
Usage:
  npm run db:delete-user -- --email=user@example.com
  npm run db:delete-user -- --phone=9812345678
  npm run db:delete-user -- --id=user-id
  npm run db:delete-user -- --name="Aayush Thakur"

Dry-run is the default. Add --confirm to delete.
Add --delete-owned-garages to also delete garages owned by matched users.

Examples:
  npm run db:delete-user -- --email=aayush@example.com
  npm run db:delete-user -- --email=aayush@example.com --confirm
`);
};

const buildWhere = () => {
  const id = getArg("id");
  const email = normalizeEmail(getArg("email"));
  const phone = normalizePhoneLoose(getArg("phone"));
  const name = getArg("name");
  const OR = [];

  if (id) OR.push({ id });
  if (email) OR.push({ email });
  if (phone) OR.push({ phone });
  if (name) OR.push({ name });

  return OR.length ? { OR } : null;
};

const countRelatedData = async (user) => {
  const [
    bookings,
    vehicles,
    locations,
    complaints,
    notifications,
    otps,
    reviews,
    wallet,
    walletTransactions,
    ownedGarages,
    pendingSignups,
    emailOtps,
    phoneOtps,
  ] = await Promise.all([
    prisma.booking.count({ where: { userId: user.id } }),
    prisma.vehicle.count({ where: { userId: user.id } }),
    prisma.customerLocation.count({ where: { userId: user.id } }),
    prisma.complaint.count({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id } }),
    prisma.otp.count({ where: { userId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.wallet.count({ where: { userId: user.id } }),
    prisma.walletTransaction.count({ where: { userId: user.id } }),
    prisma.garage.count({ where: { ownerId: user.id } }),
    prisma.pendingSignup.count({
      where: { OR: [{ email: user.email }, { phone: user.phone || "" }] },
    }),
    prisma.emailOtp.count({ where: { email: user.email } }),
    user.phone ? prisma.phoneOtp.count({ where: { phone: user.phone } }) : 0,
  ]);

  return {
    bookings,
    vehicles,
    locations,
    complaints,
    notifications,
    otps,
    reviews,
    wallet,
    walletTransactions,
    ownedGarages,
    pendingSignups,
    emailOtps,
    phoneOtps,
  };
};

const deleteMatchedUsers = async () => {
  const where = buildWhere();

  if (!where || hasFlag("help")) {
    usage();
    return;
  }

  const confirm = hasFlag("confirm");
  const deleteOwnedGarages = hasFlag("delete-owned-garages");

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (users.length === 0) {
    console.log("No matching users found.");
    return;
  }

  console.log(`Matched ${users.length} user(s):`);

  for (const user of users) {
    const counts = await countRelatedData(user);
    console.log({
      user,
      related: counts,
    });
  }

  if (!confirm) {
    console.log("\nDry-run only. Re-run with --confirm to delete these records.");
    return;
  }

  const ids = users.map((user) => user.id);
  const emails = users.map((user) => user.email);
  const phones = users.map((user) => user.phone).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.emailOtp.deleteMany({ where: { email: { in: emails } } });
    await tx.phoneOtp.deleteMany({ where: { phone: { in: phones } } });
    await tx.pendingSignup.deleteMany({
      where: {
        OR: [{ email: { in: emails } }, { phone: { in: phones } }],
      },
    });

    if (deleteOwnedGarages) {
      await tx.garage.deleteMany({ where: { ownerId: { in: ids } } });
    } else {
      await tx.garage.updateMany({
        where: { ownerId: { in: ids } },
        data: { ownerId: null },
      });
    }

    await tx.user.deleteMany({ where: { id: { in: ids } } });
  });

  console.log(`Deleted ${users.length} user(s).`);
};

deleteMatchedUsers()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
