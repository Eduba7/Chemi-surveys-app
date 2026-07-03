import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const TOTAL_SLOTS = 12;

export const projectRouter = router({
  // Always returns exactly 12 slots — fills gaps with null so the frontend
  // grid renders empty "+" cards where no project has been added yet.
  getGrid: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      include: { client: true },
      orderBy: { slotIndex: "asc" },
    });

    const grid: (typeof projects[number] | null)[] = Array.from(
      { length: TOTAL_SLOTS },
      () => null
    );

    for (const p of projects) {
      if (p.slotIndex >= 0 && p.slotIndex < TOTAL_SLOTS) {
        grid[p.slotIndex] = p;
      }
    }

    return grid;
  }),

  upsertSlot: protectedProcedure
    .input(
      z.object({
        slotIndex: z.number().min(0).max(TOTAL_SLOTS - 1),
        projectTitle: z.string().min(1),
        imageUrl: z.string().url().optional().or(z.literal("")),
        completionDate: z.string().optional(), // ISO date string
        clientId: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.upsert({
        where: { slotIndex: input.slotIndex },
        update: {
          projectTitle: input.projectTitle,
          imageUrl: input.imageUrl || null,
          completionDate: input.completionDate
            ? new Date(input.completionDate)
            : null,
          clientId: input.clientId,
          description: input.description,
        },
        create: {
          slotIndex: input.slotIndex,
          projectTitle: input.projectTitle,
          imageUrl: input.imageUrl || null,
          completionDate: input.completionDate
            ? new Date(input.completionDate)
            : null,
          clientId: input.clientId,
          description: input.description,
        },
      });
    }),

  clearSlot: protectedProcedure
    .input(z.object({ slotIndex: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.project
        .delete({ where: { slotIndex: input.slotIndex } })
        .catch(() => null); // no-op if slot was already empty
      return { success: true };
    }),
});
