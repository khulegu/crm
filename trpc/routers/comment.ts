import { db } from "@/lib/db";
import { comment, commentMention, user } from "@/lib/schema";
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
    .input(
      z.object({
        ticketId: z.string(),
        body: z.string(),
        mentionedUserIds: z.array(z.string()).optional().default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const commentId = crypto.randomUUID();

      // Insert the comment
      await db.insert(comment).values({
        id: commentId,
        body: input.body,
        ticketId: input.ticketId,
        createdBy: ctx.user.id,
      });

      // Insert mentions if any
      if (input.mentionedUserIds.length > 0) {
        await db.insert(commentMention).values(
          input.mentionedUserIds.map((userId) => ({
            commentId,
            userId,
          }))
        );
      }

      return { id: commentId };
    }),
});
