import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export * from "./auth-schema";
import { user } from "./auth-schema";

export const STATUS = {
  OPEN: 0,
  IN_PROGRESS: 1,
  CLOSED: 2,
}

export const PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
}

export const STATUS_VALUES = Object.values(STATUS);
export const PRIORITY_VALUES = Object.values(PRIORITY);

export const PRIORITY_LABEL = {
  [PRIORITY.LOW]: "Low",
  [PRIORITY.MEDIUM]: "Medium",
  [PRIORITY.HIGH]: "High",
  [PRIORITY.URGENT]: "Urgent",
}

export const STATUS_LABEL = {
  [STATUS.OPEN]: "Open",
  [STATUS.IN_PROGRESS]: "In Progress",
  [STATUS.CLOSED]: "Closed",
}

export const ticket = pgTable("ticket", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  description: text("description").notNull().default(""),

  status: integer("status").notNull().default(STATUS.OPEN),
  priority: integer("priority").default(PRIORITY.LOW),

  createdBy: text("created_by").notNull().references(() => user.id),
  assignedTo: text("assigned_to").references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const ticketTag = pgTable("ticket_tag", {
  ticketId: text("ticket_id").references(() => ticket.id),
  tagId: text("tag_id").references(() => tag.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})
