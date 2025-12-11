import { createTRPCRouter } from "../init";
import { commentRouter } from "./comment";
import { tagRouter } from "./tag";
import { ticketRouter } from "./ticket";
import { userRouter } from "./user";
import { notificationRouter } from "./notification";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  user: userRouter,
  comment: commentRouter,
  tag: tagRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
