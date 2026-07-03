import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const statusEnum = z.enum([
  "BOOKED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const consultationRouter = router({
  // Drives the Consultations page status filters and the Calendar view.
  getAll: publicProcedure
    .input(
      z
        .object({
          status: statusEnum.optional(),
          isToday: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.consultation.findMany({
        where: {
          status: input?.status,
          isToday: input?.isToday,
        },
        include: { client: true, service: true, handledBy: true },
        orderBy: { scheduledTime: "asc" },
      });
    }),

  // Today's Schedule panel
  getToday: publicProcedure.query(async ({ ctx }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return ctx.db.consultation.findMany({
      where: {
        scheduledTime: { gte: startOfDay, lte: endOfDay },
      },
      include: { client: true, service: true },
      orderBy: { scheduledTime: "asc" },
    });
  }),

  // Upcoming Tasks panel (everything after today)
  getUpcoming: publicProcedure.query(async ({ ctx }) => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return ctx.db.consultation.findMany({
      where: { scheduledTime: { gt: endOfDay } },
      include: { client: true, service: true },
      orderBy: { scheduledTime: "asc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        serviceId: z.number(),
        scheduledTime: z.string(), // ISO datetime
        location: z.string().optional(),
        source: z.string().optional(),
        isToday: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.consultation.create({
        data: {
          clientId: input.clientId,
          serviceId: input.serviceId,
          scheduledTime: new Date(input.scheduledTime),
          location: input.location,
          source: input.source || "Dashboard",
          isToday: input.isToday,
          status: "BOOKED",
          handledById: ctx.user.id,
        },
      });
    }),

  // The "live" status-cycling feature (Booked -> Confirmed -> Completed -> No-show)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: statusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const consultation = await ctx.db.consultation.findUnique({
        where: { id: input.id },
      });
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });

      const updated = await ctx.db.consultation.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: "UPDATE_CONSULTATION_STATUS",
          entity: "Consultation",
          entityId: input.id,
          detail: `Status changed to ${input.status} by ${ctx.user.fullName}`,
        },
      });

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.consultation.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Dashboard stat cards: today's tasks, upcoming, cancelled, completion %, no-shows
  stats: publicProcedure.query(async ({ ctx }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [todayCount, upcomingCount, cancelledCount, completedCount, noShowCount, totalCount, clientCount] =
      await Promise.all([
        ctx.db.consultation.count({
          where: { scheduledTime: { gte: startOfDay, lte: endOfDay } },
        }),
        ctx.db.consultation.count({
          where: { scheduledTime: { gt: endOfDay } },
        }),
        ctx.db.consultation.count({ where: { status: "CANCELLED" } }),
        ctx.db.consultation.count({ where: { status: "COMPLETED" } }),
        ctx.db.consultation.count({ where: { status: "NO_SHOW" } }),
        ctx.db.consultation.count(),
        ctx.db.client.count(),
      ]);

    const completionRate =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : null;

    return {
      todayCount,
      upcomingCount,
      cancelledCount,
      completionRate,
      noShowCount,
      clientCount,
    };
  }),
});
