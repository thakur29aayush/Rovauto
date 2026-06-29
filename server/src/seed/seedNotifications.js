require("dotenv/config");

const prisma = require("../config/prisma");

const seedNotifications = async () => {
  console.log("Seeding Notifications...");

  const users = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      isActive: true,
    },
    take: 20,
  });

  const globalNotifications = [
    {
      title: "Special offer on AC services",
      message: "Get 15% off on AC services this week.",
      type: "PROMOTION",
      link: "/services",
    },
    {
      title: "RovAuto warranty reminder",
      message: "Every completed service includes a 30-day service warranty.",
      type: "WARRANTY",
      link: "/warranty",
    },
  ];

  for (const item of globalNotifications) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: null,
        title: item.title,
        type: item.type,
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: item,
      });
    }
  }

  for (const user of users) {
    const userNotifications = [
      {
        userId: user.id,
        title: "Welcome to RovAuto",
        message:
          "Your account is ready. Add your vehicle and book trusted services.",
        type: "SYSTEM",
        link: "/dashboard",
      },
      {
        userId: user.id,
        title: "Complete your vehicle profile",
        message:
          "Add your default vehicle to get better service recommendations.",
        type: "SYSTEM",
        link: "/dashboard/vehicles",
      },
    ];

    for (const item of userNotifications) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          title: item.title,
          type: item.type,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: item,
        });
      }
    }
  }

  console.log("✅ Notifications Seeded Successfully");
};

seedNotifications()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });