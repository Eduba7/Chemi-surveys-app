import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "./db";

export interface AuthUser {
  id: number;
  role: "ADMIN" | "STAFF";
  fullName: string;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}) {
  let user: AuthUser | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecretkey"
      ) as { id: number; role: "ADMIN" | "STAFF" };

      const dbUser = await db.user.findUnique({ where: { id: decoded.id } });
      if (dbUser) {
        user = { id: dbUser.id, role: dbUser.role, fullName: dbUser.fullName };
      }
    } catch {
      // invalid/expired token — user stays null, protectedProcedure will reject
    }
  }

  return { req, res, user, db };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
