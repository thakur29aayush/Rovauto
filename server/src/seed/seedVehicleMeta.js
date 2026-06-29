require("dotenv/config");

const prisma = require("../config/prisma");

const vehicleBrands = [
  {
    name: "Maruti Suzuki",
    models: [
      "Swift",
      "Baleno",
      "Brezza",
      "Dzire",
      "WagonR",
      "Fronx",
      "Grand Vitara",
      "Alto",
      "S-presso",
      "Ignis",
      "Ertiga",
      "XL6",
    ],
  },
  {
    name: "Hyundai",
    models: ["i20", "Creta", "Venue", "Verna", "Nios"],
  },
  {
    name: "Tata",
    models: ["Nexon", "Punch", "Harrier", "Altroz", "Tiago"],
  },
  {
    name: "Mahindra",
    models: ["XUV700", "XUV 7XO", "Thar", "Scorpio N", "XUV 300", "XUV 3XO", "Bolero"],
  },
  {
    name: "Kia",
    models: ["Seltos", "Sonet", "Carens", "Carnival"],
  },
  {
    name: "Honda",
    models: ["City", "Amaze", "Elevate"],
  },
  {
    name: "Toyota",
    models: ["Innova", "Fortuner", "Glanza", "Urban Cruiser"],
  },
  {
    name: "Renault",
    models: ["Kwid", "Kiger", "Duster", "Triber"],
  },
  {
    name: "Volkswagen",
    models: ["Virtus", "Taigun", "Polo"],
  },
  {
    name: "Mercedes",
    models: ["A-class", "C-class", "S-class", "G-class"],
  },
  {
    name: "BMW",
    models: ["X1", "X3", "X5", "X7", "Z4"],
  },
  {
    name: "Audi",
    models: ["A3", "A4", "A5", "A6", "A7"],
  },
  {
    name: "Nissan",
    models: ["Magnite", "Kicks", "Sunny", "Terrano"],
  },
  {
    name: "Volvo",
    models: ["XC40", "XC60", "XC90", "S60", "S90"],
  },
  {
    name: "MG",
    models: ["Hector", "Astor", "Comet EV", "ZS EV", "Gloster"],
  },
  {
    name: "Jeep",
    models: ["Compass", "Meridian", "Wrangler", "Grand Cherokee"],
  },
  {
    name: "Land Rover",
    models: ["Range Rover", "Discovery", "Defender", "Evoque"],
  },
  {
    name: "Ford",
    models: ["Figo", "Aspire", "EcoSport", "Endeavour"],
  },
  {
    name: "Skoda",
    models: ["Kushaq", "Slavia", "Octavia", "Superb", "Kodiaq"],
  },
];

async function main() {
  console.log("Seeding vehicle brands and models...");

  for (const item of vehicleBrands) {
    const brand = await prisma.vehicleBrand.upsert({
      where: {
        name: item.name,
      },
      update: {
        isActive: true,
      },
      create: {
        name: item.name,
        isActive: true,
      },
    });

    for (const modelName of item.models) {
      await prisma.vehicleModel.upsert({
        where: {
          brandId_name: {
            brandId: brand.id,
            name: modelName,
          },
        },
        update: {
          isActive: true,
        },
        create: {
          brandId: brand.id,
          name: modelName,
          isActive: true,
        },
      });
    }
  }

  console.log("✅ Vehicle meta seeded successfully");
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