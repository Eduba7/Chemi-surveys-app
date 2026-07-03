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
      email: "johnmuiruri68@gmail.com",
      phone: "0703676856",
      role: Role.ADMIN,
      jobTitle: "Land Surveyor (Founder)",
      password: "ChangeMe123!", // CHANGE before going live
    },
    {
      fullName: "Anthony Nd'ungu Gachemi",
      email: "anthony.gachemi@chemisurveys.co.ke",
      phone: "0713772948",
      role: Role.STAFF,
      jobTitle: "Land Surveyor",
      password: "ChangeMe123!",
    },
    {
      fullName: "John Malele",
      email: "john.malele@chemisurveys.co.ke",
      phone: "0707277814",
      role: Role.STAFF,
      jobTitle: "Fieldwork Operations",
      password: "ChangeMe123!",
    },
  ];

  for (const s of staff) {
    const passwordHash = await bcrypt.hash(s.password, 10);
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        role: s.role,
        jobTitle: s.jobTitle,
        passwordHash,
      },
    });
  }

  console.log("Seeding service catalogue...");

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
