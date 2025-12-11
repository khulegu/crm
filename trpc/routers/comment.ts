import { db } from "@/lib/db";
import { comment, user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  list: baseProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select({
          id: comment.id,
          body: comment.body,
          createdAt: comment.createdAt,
          createdBy: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(comment)
        .innerJoin(user, eq(comment.createdBy, user.id))
        .where(eq(comment.ticketId, input.ticketId));
    }),

  create: baseProcedure
    .input(z.object({ ticketId: z.string(), body: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return db.insert(comment).values({
        id: crypto.randomUUID(),
        body: input.body,
        ticketId: input.ticketId,
        createdBy: ctx.user.id,
      });
    }),
});
