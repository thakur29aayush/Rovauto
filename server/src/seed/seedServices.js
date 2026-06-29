require("dotenv/config");

const prisma = require("../config/prisma");

const categories = [
  {
    name: "Car/Bike Wash & Care",
    description: "Vehicle washing, cleaning and detailing services",
    services: [
      {
        name: "Express Exterior Wash",
        description: "Foam wash, high-pressure rinse and hand dry",
        basePrice: 299,
        minPrice: 299,
        maxPrice: 399,
        durationMin: 30,
      },
      {
        name: "Full Car Wash & Interior",
        description:
          "Foam wash, underbody wash, interior vacuum, dashboard polish, window cleaning, tyre dressing and seat cleaning",
        basePrice: 999,
        minPrice: 999,
        maxPrice: 1299,
        durationMin: 120,
      },
    ],
  },
  {
    name: "Car Servicing & Repair",
    description: "Scheduled vehicle servicing and repair packages",
    services: [
      {
        name: "Standard Car Service",
        description:
          "Engine oil change, oil filter replacement, air filter cleaning, coolant top-up, brake inspection, battery check, tyre pressure check and 30-point inspection",
        basePrice: 3292,
        minPrice: 3292,
        maxPrice: 3950,
        durationMin: 360,
      },
      {
        name: "Comprehensive Car Service",
        description:
          "Synthetic engine oil, all filters, AC vent cleaning, brake cleaning, battery terminal cleaning, tyre rotation, spark plug check and full body inspection",
        basePrice: 4820,
        minPrice: 4820,
        maxPrice: 5784,
        durationMin: 480,
      },
    ],
  },
  {
    name: "AC Service",
    description: "Vehicle AC inspection, gas refill and cooling service",
    services: [
      {
        name: "Regular AC Service",
        description:
          "AC gas top-up, condenser cleaning, cooling coil service, leak test and AC vent disinfection",
        basePrice: 2161,
        minPrice: 2161,
        maxPrice: 2549,
        durationMin: 240,
      },
      {
        name: "High Performance AC Service",
        description:
          "Full AC gas recharge, condenser deep cleaning, compressor health check, AC system flush and cabin filter replacement",
        basePrice: 3922,
        minPrice: 3922,
        maxPrice: 4626,
        durationMin: 480,
      },
    ],
  },
  {
    name: "Denting & Painting",
    description: "Body repair, denting and painting work",
    services: [
      {
        name: "Panel Denting & Painting",
        description: "Single panel denting and repainting service",
        basePrice: 2499,
        minPrice: 2000,
        maxPrice: 6000,
        durationMin: 480,
      },
    ],
  },
  {
    name: "Batteries",
    description: "Battery health check and replacement",
    services: [
      {
        name: "Battery Health Check",
        description: "Battery voltage test, terminal inspection and charging system check",
        basePrice: 99,
        minPrice: 99,
        maxPrice: 199,
        durationMin: 15,
      },
      {
        name: "Battery Replacement",
        description:
          "Old battery pickup, new battery installation, terminal cleaning and old battery disposal",
        basePrice: 4999,
        minPrice: 4999,
        maxPrice: 5999,
        durationMin: 60,
      },
    ],
  },
  {
    name: "Roadside Assistance",
    description: "Emergency roadside assistance and SOS services",
    services: [
      {
        name: "SOS Emergency Assistance",
        description: "Emergency roadside assistance request sent to nearby garages",
        basePrice: 500,
        minPrice: 500,
        maxPrice: 2000,
        durationMin: 30,
      },
    ],
  },
  {
    name: "Modifications",
    description: "Vehicle modification and accessory fitting",
    services: [
      {
        name: "Basic Modification Consultation",
        description: "Vehicle modification inspection and consultation",
        basePrice: 999,
        minPrice: 999,
        maxPrice: 5000,
        durationMin: 60,
      },
    ],
  },
];

async function main() {
  console.log("Seeding service categories and services...");

  const activeCategoryNames = categories.map((category) => category.name);

  await prisma.serviceCategory.updateMany({
    where: {
      name: {
        notIn: activeCategoryNames,
      },
    },
    data: {
      isActive: false,
    },
  });

  for (const categoryData of categories) {
    const category = await prisma.serviceCategory.upsert({
      where: { name: categoryData.name },
      update: {
        description: categoryData.description,
        isActive: true,
      },
      create: {
        name: categoryData.name,
        description: categoryData.description,
        isActive: true,
      },
    });

    const activeServiceNames = categoryData.services.map((service) => service.name);

    await prisma.service.updateMany({
      where: {
        categoryId: category.id,
        name: {
          notIn: activeServiceNames,
        },
      },
      data: {
        isActive: false,
      },
    });

    for (const serviceData of categoryData.services) {
      const existing = await prisma.service.findFirst({
        where: {
          name: serviceData.name,
          categoryId: category.id,
        },
      });

      if (existing) {
        await prisma.service.update({
          where: { id: existing.id },
          data: {
            description: serviceData.description,
            basePrice: serviceData.basePrice,
            minPrice: serviceData.minPrice,
            maxPrice: serviceData.maxPrice,
            durationMin: serviceData.durationMin,
            isActive: true,
          },
        });
      } else {
        await prisma.service.create({
          data: {
            categoryId: category.id,
            name: serviceData.name,
            description: serviceData.description,
            basePrice: serviceData.basePrice,
            minPrice: serviceData.minPrice,
            maxPrice: serviceData.maxPrice,
            durationMin: serviceData.durationMin,
            isActive: true,
          },
        });
      }
    }
  }

  console.log("✅ Services seeded successfully");
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
