const prisma = require("../config/prisma");

const seedNotifications = async () => {
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
    await prisma.notification.create({
      data: item,
    });
  }

  for (const user of users) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: "Welcome to RovAuto",
          message: "Your account is ready. Add your vehicle and book trusted services.",
          type: "SYSTEM",
          link: "/dashboard",
        },
        {
          userId: user.id,
          title: "Complete your vehicle profile",
          message: "Add your default vehicle to get better service recommendations.",
          type: "SYSTEM",
          link: "/dashboard/vehicles",
        },
      ],
    });
  }

  console.log("Notifications seeded successfully");
};

seedNotifications()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });