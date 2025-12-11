import { createTRPCRouter } from "../init";
import { commentRouter } from "./comment";
import { ticketRouter } from "./ticket";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  user: userRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;
