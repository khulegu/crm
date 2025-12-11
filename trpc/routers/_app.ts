import { baseProcedure, createTRPCRouter } from "../init";
import { ticketRouter } from "./ticket";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  user: baseProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});

export type AppRouter = typeof appRouter;
