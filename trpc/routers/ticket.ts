import { ticket } from '@/lib/schema';
import { baseProcedure, createTRPCRouter, } from '../init';
import { db } from '@/lib/db';
import z from 'zod';
import { TRPCError } from '@trpc/server';

export const ticketRouter = createTRPCRouter({
  list: baseProcedure.query(async ({ ctx }) => {
    const tickets = await db.select().from(ticket);
    return tickets;
  }),

  create: baseProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const [newTicket] = await db.insert(ticket).values({
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      createdBy: ctx.user.id,
    }).returning();

    return newTicket;
  }),
});

