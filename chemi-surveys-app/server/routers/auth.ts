import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const secret = process.env.JWT_SECRET || "supersecretkey";
      const token = jwt.sign(
        { id: user.id, role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" } as any
      );

      return {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle,
      phone: user.phone,
    };
  }),

  // Lists firm personnel for the "My Account" dropdown / About page.
  staffDirectory: publicProcedure.query(async ({ ctx }) => {
    const staff = await ctx.db.user.findMany({
      select: { id: true, fullName: true, phone: true, jobTitle: true, role: true },
      orderBy: { id: "asc" },
    });
    return staff;
  }),
});
