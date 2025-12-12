"use client";

import { STATUS, STATUS_LABEL } from "@/lib/schema";
import { trpc } from "@/trpc/client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "./kibo-ui/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const STATUS_COLOR = {
  [STATUS.OPEN]: "#6B7280",
  [STATUS.IN_PROGRESS]: "#F59E0B",
  [STATUS.CLOSED]: "#10B981",
};

export function TicketKanban() {
  const { data: tickets } = trpc.ticket.list.useQuery();

  return (
    <div>
      {tickets && (
        <KanbanProvider
          columns={Object.entries(STATUS).map(([key, value]) => ({
            id: value.toString(),
            name: STATUS_LABEL[value],
            color: STATUS_COLOR[value],
          }))}
          data={tickets.map((ticket) => ({
            id: ticket.id,
            name: ticket.title,
            column: ticket.status.toString(),
            ticket,
          }))}
          onDataChange={() => {}}
        >
          {(column) => (
            <KanbanBoard
              id={column.id}
              key={column.id}
              className="min-h-[500px] bg-muted/50 shadow-none"
            >
              <KanbanHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span>{column.name}</span>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(item: {
                  id: string;
                  name: string;
                  column: string;
                  ticket: (typeof tickets)[number];
                }) => (
                  <KanbanCard
                    column={column.id}
                    id={item.id}
                    key={item.id}
                    name={item.name}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {item.ticket.title}
                        </p>
                      </div>
                      {item.ticket.assignedTo && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage
                            src={item.ticket.assignedTo.image ?? undefined}
                          />
                          <AvatarFallback>
                            {item.ticket.assignedTo.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="m-0 text-muted-foreground text-xs">
                      {item.ticket.startDate
                        ? shortDateFormatter.format(item.ticket.startDate)
                        : ""}
                      -{" "}
                      {item.ticket.dueDate
                        ? dateFormatter.format(item.ticket.dueDate)
                        : ""}
                    </p>
                  </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      )}
    </div>
  );
}
