import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const notificationRouter = router({
  // Simulates sending an email/SMS (e.g. consultation confirmation/reminder).
  // Swap the body of this mutation for a real provider call
  // (e.g. SendGrid, Africa's Talking SMS API) when going live.
  send: protectedProcedure
    .input(
      z.object({
        channel: z.enum(["EMAIL", "SMS"]),
        recipient: z.string().min(1),
        subject: z.string().optional(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.notification.create({
        data: {
          channel: input.channel,
          recipient: input.recipient,
          subject: input.subject,
          message: input.message,
          status: "SENT", // simulated — always succeeds in this scaffold
        },
      });
      return record;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),
});
