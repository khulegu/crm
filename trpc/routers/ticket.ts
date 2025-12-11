import { ticket } from '@/lib/schema';
import { baseProcedure, createTRPCRouter, } from '../init';

export const ticketRouter = createTRPCRouter({
  list: baseProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.select().from(ticket);
    return tickets;
  }),
});

