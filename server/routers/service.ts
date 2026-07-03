import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const serviceRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.service.findMany({ orderBy: { id: "asc" } });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        iconKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.service.create({ data: input });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        iconKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.service.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.service.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
