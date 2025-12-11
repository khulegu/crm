import { db } from "@/lib/db";
import { tag, ticket, ticketTag, user } from "@/lib/schema";
import { TRPCError } from "@trpc/server";
import { desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

const ticketWithUser = () => {
  const assignedTo = alias(user, "assignedTo");
  const createdBy = alias(user, "createdBy");
  return {
    query: db
      .select({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority ?? null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        startDate: ticket.startDate,
        dueDate: ticket.dueDate,
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
      .leftJoin(assignedTo, eq(ticket.assignedTo, assignedTo.id)),
    assignedTo: assignedTo,
    createdBy: createdBy,
  };
};

export const ticketRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    const { query } = ticketWithUser();
    const tickets = await query.orderBy(desc(ticket.createdAt));

    const ticketTags = await db
      .select({
        ticketId: ticketTag.ticketId,
        id: tag.id,
        name: tag.name,
      })
      .from(ticketTag)
      .innerJoin(tag, eq(ticketTag.tagId, tag.id))
      .where(
        inArray(
          ticketTag.ticketId,
          tickets.map((ticket) => ticket.id)
        )
      );

    return tickets.map((ticket) => ({
      ...ticket,
      tags: ticketTags
        .filter((tag) => ticket.id === tag.ticketId)
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
        })),
    }));
  }),

  get: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { query } = ticketWithUser();

      const tickets = await query.where(eq(ticket.id, input.id)).limit(1);

      if (!tickets.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const ticketTags = await db
        .select({
          id: tag.id,
          name: tag.name,
        })
        .from(ticketTag)
        .innerJoin(tag, eq(ticketTag.tagId, tag.id))
        .where(eq(ticketTag.ticketId, input.id));

      return {
        ...tickets[0],
        tags: ticketTags,
      };
    }),

  create: baseProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        status: z.number(),
        priority: z.number().nullable(),
        assignedTo: z.string().nullable(),
        startDate: z.date().nullable(),
        dueDate: z.date().nullable(),
        tags: z.array(z.string()).nullable(),
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
          startDate: input.startDate,
          dueDate: input.dueDate,
        })
        .returning();

      if (input.tags) {
        await db.insert(ticketTag).values(
          input.tags.map((tag) => ({
            ticketId: newTicket.id,
            tagId: tag,
          }))
        );
      }

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
        startDate: z.date().nullable(),
        dueDate: z.date().nullable(),
        tags: z.array(z.string()).nullable(),
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
          startDate: input.startDate,
          dueDate: input.dueDate,
        })
        .where(eq(ticket.id, input.id))
        .returning();

      if (input.tags) {
        await db.delete(ticketTag).where(eq(ticketTag.ticketId, input.id));
        await db.insert(ticketTag).values(
          input.tags.map((tag) => ({
            ticketId: input.id,
            tagId: tag,
          }))
        );
      }

      return updatedTicket;
    }),
});
