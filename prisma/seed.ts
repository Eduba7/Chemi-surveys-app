// Seeds the database with firm staff and the service catalogue ONLY.
// Deliberately does NOT seed Clients, Projects, or Consultations —
// per project requirements these start empty and are populated by
// Surveyor John Muiruri Gachemi through the dashboard UI.
//
// Run: npm run db:seed

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding staff users...");

  const staff = [
    {
      fullName: "John Muiruri Gachemi",
      email: "muirawray68gmail.com",  // change to new email address 
      phone: "0703676856",
      role: Role.ADMIN,
      jobTitle: "Land Surveyor (Founder)",
      password: "johnmoh68@", // change to new password
    },
    {
      fullName: "Anthony Nd'ungu Gachemi",
      email: "anthonygacemisurvey@gmail.com", //change to new email address
      phone: "0713772948",
      role: Role.STAFF,
      jobTitle: "Land Surveyor",
      password: "&AnthonyGacemi21", // change to new password
    },
    {
      fullName: "John Malele",
      email: "johnmalelecs@gmail.com",
      phone: "0707277814",
      role: Role.STAFF,
      jobTitle: "Fieldwork Operations",
      password: "marley77$", // change to new password
    },
  ];

  for (const user of staff) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email }, //assume email is unique
      update: {
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        jobTitle: user.jobTitle,
        passwordHash: hashedPassword,
      },
      create: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        jobTitle: user.jobTitle,
        passwordHash: hashedPassword,
      },
    });
    console.log(`Upserted user: ${user.email}`);
}

  console.log("seeding finished.");

main()
   .catch((e) => {
      console.error("Error during seeding:", e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });

  const services = [
    {
      name: "Boundary Survey",
      description:
        "Precise demarcation of land parcels per Survey of Kenya standards.",
      iconKey: "border-outer",
    },
    {
      name: "Topographic Survey",
      description:
        "Detailed elevation and terrain mapping for engineering and planning.",
      iconKey: "trending-up",
    },
    {
      name: "GPS/GNSS Survey",
      description:
        "High-precision satellite-based positioning for cadastral and control surveys.",
      iconKey: "satellite",
    },
    {
      name: "Cadastral Mapping",
      description:
        "Official land parcel mapping for title deed and registry purposes.",
      iconKey: "map-2",
    },
    {
      name: "Site Planning",
      description:
        "Spatial planning support for construction and development projects.",
      iconKey: "building",
    },
    {
      name: "GIS Data Processing",
      description:
        "Spatial data analysis, digitizing, and GIS report generation.",
      iconKey: "database",
    },
  ];

  for (const svc of services) {
    const existing = await prisma.service.findFirst({
      where: { name: svc.name },
    });
    if (!existing) {
      await prisma.service.create({ data: svc });
    }
  }

  console.log("Seed complete. Clients, Projects, and Consultations remain empty by design.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
