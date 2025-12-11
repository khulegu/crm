import { db } from "@/lib/db";
import { notification } from "@/lib/schema";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const notificationRouter = createTRPCRouter({
  list: baseProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return db
      .select({
        id: notification.id,
        body: notification.body,
        isRead: notification.isRead,
        type: notification.type,
        ticketId: notification.ticketId,
        commentId: notification.commentId,
        createdAt: notification.createdAt,
      })
      .from(notification)
      .where(eq(notification.userId, ctx.user!.id))
      .orderBy(desc(notification.createdAt));
  }),

  markAsRead: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(notification)
        .set({ isRead: true })
        .where(eq(notification.id, input.id));
    }),
});
