require("dotenv/config");

const prisma = require("../config/prisma");

async function main() {
  console.log("Seeding Garages...");

  const services = await prisma.service.findMany({
    where: { isActive: true },
  });

  if (services.length === 0) {
    console.log("Run seedServices first.");
    return;
  }

  const garages = [
    {
      name: "AutoCare Premium",
      description:
        "Top rated verified garage for same-day service. Frontend card: 1.2 km away, ETA Today 6 PM.",
      phone: "9876500001",
      whatsappNo: "9876500001",
      email: "autocarepremium@test.com",
      address: "Indirapuram, Ghaziabad",
      city: "Ghaziabad",
      area: "Indirapuram",
      latitude: 28.6367,
      longitude: 77.3691,
      ratingAvg: 4.8,
      ratingCount: 1284,
    },
    {
      name: "Speed Motors Workshop",
      description:
        "Trusted partner garage for nearby bookings. Frontend card: 2.4 km away, ETA Today 7 PM.",
      phone: "9876500002",
      whatsappNo: "9876500002",
      email: "speedmotors@test.com",
      address: "Vaishali, Ghaziabad",
      city: "Ghaziabad",
      area: "Vaishali",
      latitude: 28.6492,
      longitude: 77.3397,
      ratingAvg: 4.7,
      ratingCount: 892,
    },
    {
      name: "Prime Auto Hub",
      description:
        "Fast service verified garage for Noida customers. Frontend card: 3.1 km away, ETA Tomorrow 10 AM.",
      phone: "9876500003",
      whatsappNo: "9876500003",
      email: "primeautohub@test.com",
      address: "Sector 62, Noida",
      city: "Noida",
      area: "Sector 62",
      latitude: 28.6289,
      longitude: 77.3649,
      ratingAvg: 4.6,
      ratingCount: 654,
    },
  ];

  for (const garageData of garages) {
    let garage = await prisma.garage.findFirst({
      where: {
        name: garageData.name,
        phone: garageData.phone,
      },
    });

    if (!garage) {
      garage = await prisma.garage.create({
        data: {
          ...garageData,
          isVerified: true,
          isActive: true,
          openingTime: "09:00",
          closingTime: "19:00",
        },
      });
    } else {
      garage = await prisma.garage.update({
        where: { id: garage.id },
        data: {
          ...garageData,
          isVerified: true,
          isActive: true,
          openingTime: "09:00",
          closingTime: "19:00",
        },
      });
    }

    await prisma.garageWallet.upsert({
      where: { garageId: garage.id },
      update: {
        balance: 1000,
      },
      create: {
        garageId: garage.id,
        balance: 1000,
      },
    });

    for (const service of services) {
      const existingGarageService = await prisma.garageService.findFirst({
        where: {
          garageId: garage.id,
          serviceId: service.id,
        },
      });

      const price =
        service.basePrice ||
        service.minPrice ||
        Math.floor(Math.random() * 4000) + 500;

      const duration =
        service.durationMin ||
        [30, 60, 90, 120][Math.floor(Math.random() * 4)];

      if (!existingGarageService) {
        await prisma.garageService.create({
          data: {
            garageId: garage.id,
            serviceId: service.id,
            price,
            duration,
            isActive: true,
          },
        });
      } else {
        await prisma.garageService.update({
          where: { id: existingGarageService.id },
          data: {
            price,
            duration,
            isActive: true,
          },
        });
      }
    }

    const existingImages = await prisma.garageImage.count({
      where: { garageId: garage.id },
    });

    if (existingImages === 0) {
      await prisma.garageImage.createMany({
        data: [
          {
            garageId: garage.id,
            imageUrl:
              "https://images.unsplash.com/photo-1632823471565-1ecdf5c7ad48",
            publicId: `seed/${garage.name
              .toLowerCase()
              .replaceAll(" ", "-")}-1`,
            order: 0,
            isThumbnail: true,
          },
          {
            garageId: garage.id,
            imageUrl:
              "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e",
            publicId: `seed/${garage.name
              .toLowerCase()
              .replaceAll(" ", "-")}-2`,
            order: 1,
            isThumbnail: false,
          },
        ],
      });
    }
  }

  console.log("✅ Garages Seeded Successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
