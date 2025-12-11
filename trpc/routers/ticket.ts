import { db } from "@/lib/db";
import { ticket, user } from "@/lib/schema";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const ticketRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    const assignedTo = alias(user, "assignedTo");
    const createdBy = alias(user, "createdBy");

    const tickets = await db
      .select({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority ?? null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        createdBy: {
          id: createdBy.id,
          name: createdBy.name,
          image: createdBy.image,
        },
        assignedTo: {
          id: assignedTo.id,
          name: assignedTo.name,
          image: assignedTo.image,
        },
      })
      .from(ticket)
      .innerJoin(createdBy, eq(ticket.createdBy, createdBy.id))
      .leftJoin(assignedTo, eq(ticket.assignedTo, assignedTo.id))
      .orderBy(desc(ticket.createdAt));

    return tickets;
  }),

  get: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return db.query.ticket.findFirst({
        where: eq(ticket.id, input.id),
      });
    }),

  create: baseProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        status: z.number(),
        priority: z.number().nullable(),
        assignedTo: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [newTicket] = await db
        .insert(ticket)
        .values({
          id: crypto.randomUUID(),
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          assignedTo: input.assignedTo,
          createdBy: ctx.user.id,
        })
        .returning();

      return newTicket;
    }),

  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.number(),
        priority: z.number().nullable(),
        assignedTo: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [updatedTicket] = await db
        .update(ticket)
        .set({
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          assignedTo: input.assignedTo,
        })
        .where(eq(ticket.id, input.id))
        .returning();

      if (!updatedTicket) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedTicket;
    }),
});
