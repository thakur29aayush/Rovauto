require("dotenv/config");

const prisma = require("../config/prisma");

async function main() {
  console.log("Seeding Service Categories...");

  const categories = [
    {
      name: "General Service",
      services: ["Basic Service", "Full Service", "Engine Oil Change"],
    },
    {
      name: "Engine",
      services: ["Engine Repair", "Engine Diagnostics", "Engine Tuning"],
    },
    {
      name: "Tyres",
      services: ["Tyre Change", "Wheel Balancing", "Wheel Alignment"],
    },
    {
      name: "Battery",
      services: ["Battery Replacement", "Battery Check"],
    },
    {
      name: "Brake",
      services: ["Brake Pad Replacement", "Brake Inspection"],
    },
    {
      name: "AC",
      services: ["AC Service", "AC Gas Refill"],
    },
    {
      name: "Electrical",
      services: ["Headlight Repair", "Wiring Repair"],
    },
    {
      name: "Cleaning",
      services: ["Car Wash", "Interior Cleaning"],
    },
  ];

  for (const category of categories) {
    const createdCategory = await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        description: `${category.name} related services`,
      },
    });

    for (const serviceName of category.services) {
      const existingService = await prisma.service.findFirst({
        where: {
          name: serviceName,
          categoryId: createdCategory.id,
        },
      });

      if (!existingService) {
        await prisma.service.create({
          data: {
            name: serviceName,
            description: `${serviceName} service`,
            categoryId: createdCategory.id,
          },
        });
      }
    }
  }

  console.log("✅ Services Seeded Successfully");
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