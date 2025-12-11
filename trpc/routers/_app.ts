import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { ticketRouter } from './ticket';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  ticket: ticketRouter,
});

export type AppRouter = typeof appRouter;
