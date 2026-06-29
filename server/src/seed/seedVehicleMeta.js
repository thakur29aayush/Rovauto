require("dotenv/config");

const prisma = require("../config/prisma");

const vehicleBrands = [
  {
    name: "Maruti Suzuki",
    models: [
      "Alto",
      "Swift",
      "Baleno",
      "Brezza",
      "Dzire",
      "E-Brezza",
      "WagonR",
      "Fronx",
      "Grand Vitara",
      "Invicto",
      "Jimny",
      "S-Presso",
      "Eeco",
      "Ertiga",
      "XL6",
      "Victoris",
    ],
  },
  {
    name: "Hyundai",
    models: [
      "Aura",
      "Creta",
      "Exter",
      "Grand i10 Nios",
      "i10",
      "i20",
      "Venue",
      "Verna",
    ],
  },
  {
    name: "Tata",
    models: [
      "Altroz",
      "Curvv",
      "Gravitas",
      "Harrier",
      "Nexon",
      "Punch",
      "Safari",
      "Sierra",
      "Tiago",
      "Tigor",
    ],
  },
  {
    name: "Mahindra",
    models: [
      "BE 6",
      "Bolero",
      "Bolero Neo",
      "Scorpio Classic",
      "Scorpio N",
      "Thar",
      "Thar Roxx",
      "XEV 9e",
      "XUV 3XO",
      "XUV 7XO",
      "XUV700",
    ],
  },
  {
    name: "Kia",
    models: [
      "Carens",
      "Carnival",
      "Clavis",
      "EV6",
      "EV9",
      "Seltos",
      "Sonet",
      "Syros",
    ],
  },
  {
    name: "Honda",
    models: ["City", "Amaze", "Elevate"],
  },
  {
    name: "Toyota",
    models: [
      "Camry",
      "Fortuner",
      "Glanza",
      "Hilux",
      "Innova",
      "Innova Crysta",
      "Land Cruiser",
      "Legender",
      "Rumion",
      "Taisor",
      "Urban Cruiser",
      "Vellfire",
    ],
  },
  {
    name: "Renault",
    models: ["Kwid", "Kiger", "Duster", "Triber"],
  },
  {
    name: "Volkswagen",
    models: ["Golf GTI", "Taigun", "Taigun R-Line", "Tayron R-Line", "Virtus"],
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
    models: ["Magnite", "X-Trail"],
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
  {
    name: "Datsun",
    models: ["Go", "Go Plus", "Redi-Go"],
  },
];

async function main() {
  console.log("Seeding vehicle brands and models...");

  const activeBrandNames = vehicleBrands.map((brand) => brand.name);

  await prisma.vehicleBrand.updateMany({
    where: {
      name: {
        notIn: activeBrandNames,
      },
    },
    data: {
      isActive: false,
    },
  });

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

    await prisma.vehicleModel.updateMany({
      where: {
        brandId: brand.id,
        name: {
          notIn: item.models,
        },
      },
      data: {
        isActive: false,
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
