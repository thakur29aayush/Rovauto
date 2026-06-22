require("dotenv/config");

const prisma = require("../config/prisma");

const sampleImages = [
  "https://images.unsplash.com/photo-1487754180451-c456f719a1fc",
  "https://images.unsplash.com/photo-1625047509168-a7026f36de04",
  "https://images.unsplash.com/photo-1613214149922-f1809c99b414",
];

async function main() {
  console.log("Seeding Service Categories and Services...");

  const categories = [
    {
      name: "General Service",
      services: [
        {
          name: "Basic Service",
          description: "Basic vehicle inspection and routine service.",
          basePrice: 800,
          minPrice: 500,
          maxPrice: 1500,
          durationMin: 60,
        },
        {
          name: "Full Service",
          description: "Complete vehicle service with inspection and maintenance.",
          basePrice: 2500,
          minPrice: 1500,
          maxPrice: 5000,
          durationMin: 180,
        },
        {
          name: "Engine Oil Change",
          description: "Engine oil replacement and basic engine check.",
          basePrice: 1200,
          minPrice: 800,
          maxPrice: 3000,
          durationMin: 45,
        },
      ],
    },
    {
      name: "Engine",
      services: [
        {
          name: "Engine Repair",
          description: "Engine issue diagnosis and repair.",
          basePrice: 5000,
          minPrice: 3000,
          maxPrice: 20000,
          durationMin: 240,
        },
        {
          name: "Engine Diagnostics",
          description: "Computerized engine diagnostics.",
          basePrice: 1000,
          minPrice: 700,
          maxPrice: 2500,
          durationMin: 60,
        },
        {
          name: "Engine Tuning",
          description: "Engine performance tuning and adjustment.",
          basePrice: 2500,
          minPrice: 1500,
          maxPrice: 7000,
          durationMin: 120,
        },
      ],
    },
    {
      name: "Tyres",
      services: [
        {
          name: "Tyre Change",
          description: "Tyre replacement service.",
          basePrice: 700,
          minPrice: 500,
          maxPrice: 2000,
          durationMin: 45,
        },
        {
          name: "Wheel Balancing",
          description: "Wheel balancing for smoother driving.",
          basePrice: 1000,
          minPrice: 800,
          maxPrice: 2500,
          durationMin: 60,
        },
        {
          name: "Wheel Alignment",
          description: "Wheel alignment check and adjustment.",
          basePrice: 1200,
          minPrice: 1000,
          maxPrice: 3000,
          durationMin: 60,
        },
      ],
    },
    {
      name: "Battery",
      services: [
        {
          name: "Battery Replacement",
          description: "Vehicle battery replacement.",
          basePrice: 3000,
          minPrice: 2000,
          maxPrice: 10000,
          durationMin: 45,
        },
        {
          name: "Battery Check",
          description: "Battery health and charging system check.",
          basePrice: 500,
          minPrice: 300,
          maxPrice: 1000,
          durationMin: 30,
        },
      ],
    },
    {
      name: "Brake",
      services: [
        {
          name: "Brake Pad Replacement",
          description: "Brake pad inspection and replacement.",
          basePrice: 2500,
          minPrice: 1500,
          maxPrice: 8000,
          durationMin: 90,
        },
        {
          name: "Brake Inspection",
          description: "Complete brake system inspection.",
          basePrice: 600,
          minPrice: 400,
          maxPrice: 1500,
          durationMin: 45,
        },
      ],
    },
    {
      name: "AC",
      services: [
        {
          name: "AC Service",
          description: "Vehicle AC inspection and servicing.",
          basePrice: 2000,
          minPrice: 1500,
          maxPrice: 6000,
          durationMin: 120,
        },
        {
          name: "AC Gas Refill",
          description: "AC gas refill and cooling check.",
          basePrice: 1800,
          minPrice: 1200,
          maxPrice: 4000,
          durationMin: 60,
        },
      ],
    },
    {
      name: "Electrical",
      services: [
        {
          name: "Headlight Repair",
          description: "Headlight repair and replacement.",
          basePrice: 800,
          minPrice: 500,
          maxPrice: 3000,
          durationMin: 45,
        },
        {
          name: "Wiring Repair",
          description: "Vehicle wiring issue diagnosis and repair.",
          basePrice: 2500,
          minPrice: 1000,
          maxPrice: 10000,
          durationMin: 180,
        },
      ],
    },
    {
      name: "Cleaning",
      services: [
        {
          name: "Car Wash",
          description: "Exterior vehicle wash.",
          basePrice: 500,
          minPrice: 300,
          maxPrice: 1200,
          durationMin: 45,
        },
        {
          name: "Interior Cleaning",
          description: "Interior vacuuming and deep cleaning.",
          basePrice: 1500,
          minPrice: 1000,
          maxPrice: 4000,
          durationMin: 120,
        },
      ],
    },
    {
      name: "Emergency",
      services: [
        {
          name: "SOS Emergency Assistance",
          description: "Emergency roadside assistance request sent to nearby garages.",
          basePrice: 500,
          minPrice: 500,
          maxPrice: 2000,
          durationMin: 30,
        },
      ],
    },
  ];

  for (const category of categories) {
    const createdCategory = await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {
        description: `${category.name} related services`,
        isActive: true,
      },
      create: {
        name: category.name,
        description: `${category.name} related services`,
        isActive: true,
      },
    });

    for (const serviceData of category.services) {
      let service = await prisma.service.findFirst({
        where: {
          name: serviceData.name,
          categoryId: createdCategory.id,
        },
      });

      if (!service) {
        service = await prisma.service.create({
          data: {
            categoryId: createdCategory.id,
            name: serviceData.name,
            description: serviceData.description,
            basePrice: serviceData.basePrice,
            minPrice: serviceData.minPrice,
            maxPrice: serviceData.maxPrice,
            durationMin: serviceData.durationMin,
            isActive: true,
          },
        });
      } else {
        service = await prisma.service.update({
          where: { id: service.id },
          data: {
            description: serviceData.description,
            basePrice: serviceData.basePrice,
            minPrice: serviceData.minPrice,
            maxPrice: serviceData.maxPrice,
            durationMin: serviceData.durationMin,
            isActive: true,
          },
        });
      }

      const existingMedia = await prisma.serviceMedia.count({
        where: { serviceId: service.id },
      });

      if (existingMedia === 0) {
        await prisma.serviceMedia.createMany({
          data: sampleImages.map((url, index) => ({
            serviceId: service.id,
            mediaType: "IMAGE",
            url,
            publicId: `seed/${service.name
              .toLowerCase()
              .replaceAll(" ", "-")}-${index}`,
            order: index,
            isThumbnail: index === 0,
          })),
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