import { db } from "@/lib/db";
import { notification, tag, ticket, ticketTag, user } from "@/lib/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, inArray, SQL } from "drizzle-orm";
import { alias, PgColumn } from "drizzle-orm/pg-core";
import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

const sortingSchema = z.array(
  z.object({
    id: z.string(),
    desc: z.boolean(),
  })
);

const ticketWithUser = () => {
  const assignedTo = alias(user, "assignedTo");
  const createdBy = alias(user, "createdBy");
  return {
    assignedTo,
    createdBy,
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
  };
};

export const ticketRouter = createTRPCRouter({
  list: baseProcedure
    .input(
      z.object({
        sorting: sortingSchema.nullable(),
        pageIndex: z.number().nullable(),
        pageSize: z.number().nullable(),
        status: z.number().nullable().optional(),
        priority: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const { query } = ticketWithUser();

      const sortableColumns = {
        title: ticket.title,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        startDate: ticket.startDate,
        dueDate: ticket.dueDate,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        createdBy: ticket.createdBy,
      } as Record<string, PgColumn>;

      const sorting =
        input.sorting
          ?.filter((sort) => sort.id in sortableColumns)
          ?.map((sort) => {
            return sort.desc
              ? desc(sortableColumns[sort.id])
              : asc(sortableColumns[sort.id]);
          }) ?? [];

      // Build filter conditions
      const conditions: SQL[] = [];
      if (input.status !== null && input.status !== undefined) {
        conditions.push(eq(ticket.status, input.status));
      }
      if (input.priority !== null && input.priority !== undefined) {
        conditions.push(eq(ticket.priority, input.priority));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const tickets = await query
        .where(whereClause)
        .orderBy(...sorting)
        .limit(input.pageSize ?? 10)
        .offset((input.pageIndex ?? 0) * (input.pageSize ?? 10));

      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(ticket)
        .where(whereClause);

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

      return {
        tickets: tickets.map((ticket) => ({
          ...ticket,
          tags: ticketTags
            .filter((tag) => ticket.id === tag.ticketId)
            .map((tag) => ({
              id: tag.id,
              name: tag.name,
            })),
        })),
        totalCount,
        pageIndex: input.pageIndex ?? 0,
        pageSize: input.pageSize ?? 10,
      };
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

      if (input.assignedTo) {
        await db.insert(notification).values({
          id: crypto.randomUUID(),
          userId: input.assignedTo,
          body: `You have been assigned to ticket ${newTicket.title}`,
          type: "ticket_assigned",
          ticketId: newTicket.id,
        });
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

      const [oldAssignedTo] = await db
        .select({ id: ticket.assignedTo })
        .from(ticket)
        .where(eq(ticket.id, input.id))
        .limit(1);

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

        if (input.tags.length) {
          await db.insert(ticketTag).values(
            input.tags.map((tag) => ({
              ticketId: input.id,
              tagId: tag,
            }))
          );
        }
      }

      if (oldAssignedTo.id !== input.assignedTo) {
        if (input.assignedTo) {
          await db.insert(notification).values({
            id: crypto.randomUUID(),
            userId: input.assignedTo,
            body: `You have been assigned to ticket ${input.title}`,
            type: "ticket_assigned",
            ticketId: input.id,
          });
        }
      }

      return updatedTicket;
    }),

  updateStatus: baseProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          status: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      console.log(input);

      for (const item of input) {
        await db
          .update(ticket)
          .set({ status: item.status })
          .where(eq(ticket.id, item.id));
      }
      return input;
    }),
});
