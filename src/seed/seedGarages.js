require("dotenv/config");
const prisma = require("../config/prisma");

async function main() {

  console.log("Seeding Garages...");

  const services = await prisma.service.findMany();

  if (services.length === 0) {
    console.log("Run seedServices first.");
    return;
  }

  const garages = [
    {
      name: "Kathmandu Auto Care",
      phone: "9800001111",
      whatsappNo: "9800001111",
      email: "garage1@test.com",
      address: "Baneshwor",
      city: "Kathmandu",
      area: "Baneshwor",
      latitude: 27.6900,
      longitude: 85.3450,
      ratingAvg: 4.7,
      ratingCount: 221,
    },
    {
      name: "Speed Garage",
      phone: "9800002222",
      whatsappNo: "9800002222",
      email: "garage2@test.com",
      address: "Koteshwor",
      city: "Kathmandu",
      area: "Koteshwor",
      latitude: 27.6785,
      longitude: 85.3495,
      ratingAvg: 4.4,
      ratingCount: 140,
    },
    {
      name: "Lalitpur Motors",
      phone: "9800003333",
      whatsappNo: "9800003333",
      email: "garage3@test.com",
      address: "Jawalakhel",
      city: "Lalitpur",
      area: "Jawalakhel",
      latitude: 27.6730,
      longitude: 85.3155,
      ratingAvg: 4.8,
      ratingCount: 321,
    }
  ];

  for (const garageData of garages) {

    const garage = await prisma.garage.create({

      data: {

        ...garageData,

        isVerified: true,

        openingTime: "09:00",

        closingTime: "19:00",

      },

    });

    for (const service of services) {

      await prisma.garageService.create({

        data: {

          garageId: garage.id,

          serviceId: service.id,

          price: Math.floor(Math.random() * 4000) + 500,

          duration: [30,60,90,120][Math.floor(Math.random()*4)],

        },

      });

    }

    for(let i=0;i<5;i++){

      const date=new Date();

      date.setDate(date.getDate()+i);

      const slots=[

        ["09:00","10:00"],

        ["10:00","11:00"],

        ["11:00","12:00"],

        ["13:00","14:00"],

        ["15:00","16:00"],

      ];

      for(const slot of slots){

        await prisma.garageSlot.create({

          data:{

            garageId:garage.id,

            date,

            startTime:slot[0],

            endTime:slot[1],

            capacity:3,

            bookedCount:0,

          }

        })

      }

    }

  }

  console.log("✅ Garages Seeded");

}

main()

.then(async()=>{

await prisma.$disconnect()

})

.catch(async(e)=>{

console.log(e)

await prisma.$disconnect()

})