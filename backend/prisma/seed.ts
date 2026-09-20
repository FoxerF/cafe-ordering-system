import "dotenv/config";
import bcrypt from "bcryptjs";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl =
  process.env.DATABASE_URL ??
  "file:./dev.db";

const adapter =
  new PrismaBetterSqlite3({
    url: databaseUrl,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

async function main() {
  const email =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error(
      "ADMIN_EMAIL is not configured",
    );
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not configured",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 8 characters",
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12,
    );

  const admin =
    await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        passwordHash,
        role: "ADMIN",
      },
      create: {
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

  console.log(
    `Admin account ready: ${admin.email}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });