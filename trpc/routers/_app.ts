import { createTRPCRouter } from "../init";
import { commentRouter } from "./comment";
import { tagRouter } from "./tag";
import { ticketRouter } from "./ticket";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  user: userRouter,
  comment: commentRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
