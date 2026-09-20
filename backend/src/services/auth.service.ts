import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/app-error.js";

export async function loginUser(
  email: string,
  password: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const user =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (!user) {
    throw new AppError(
      401,
      "Invalid email or password",
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      user.passwordHash,
    );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "Invalid email or password",
    );
  }

  return user;
}

export async function getUserById(
  id: number,
) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}