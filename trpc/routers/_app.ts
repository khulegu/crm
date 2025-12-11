import { createTRPCRouter } from "../init";
import { ticketRouter } from "./ticket";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
