import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const userRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    return db.query.user.findMany();
  }),
  get: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.query.user.findFirst({ where: eq(user.id, input.id) });
    }),
  me: baseProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});
