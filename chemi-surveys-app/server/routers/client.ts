import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const clientInput = z.object({
  nameOrCompany: z.string().min(1, "Client or company name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const clientRouter = router({
  // Public read so the portfolio site can showcase clients without auth.
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.client.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { id: input.id },
        include: { consultations: true, projects: true },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      return client;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.client.findMany({
        where: {
          nameOrCompany: { contains: input.query },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Only signed-in staff can add/edit/delete clients — this is how the
  // surveyor builds up his own client directory from a blank slate.
  create: protectedProcedure.input(clientInput).mutation(async ({ ctx, input }) => {
    return ctx.db.client.create({
      data: {
        nameOrCompany: input.nameOrCompany,
        email: input.email || null,
        phone: input.phone || null,
        logoUrl: input.logoUrl || null,
        notes: input.notes || null,
      },
    });
  }),

  update: protectedProcedure
    .input(clientInput.extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.client.update({
        where: { id },
        data: {
          nameOrCompany: data.nameOrCompany,
          email: data.email || null,
          phone: data.phone || null,
          logoUrl: data.logoUrl || null,
          notes: data.notes || null,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.client.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
