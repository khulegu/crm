import { ticket } from '@/lib/schema';
import { baseProcedure, createTRPCRouter, } from '../init';
import { db } from '@/lib/db';

export const ticketRouter = createTRPCRouter({
  list: baseProcedure.query(async ({ ctx }) => {
    const tickets = await db.select().from(ticket);
    return tickets;
  }),
});

