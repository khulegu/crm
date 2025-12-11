import { db } from "@/lib/db";
import { tag } from "@/lib/schema";
import { baseProcedure, createTRPCRouter } from "../init";
import z from "zod";

export const tagRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    return db.select({ id: tag.id, name: tag.name }).from(tag);
  }),
  create: baseProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const [newTag] = await db
        .insert(tag)
        .values({ id: crypto.randomUUID(), name: input.name })
        .returning();
      return newTag;
    }),
});
