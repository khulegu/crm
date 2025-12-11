import { trpc } from "@/trpc/client";
import TicketForm from "./ticket-form";
import TicketComments from "./ticket-comments";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "./ui/breadcrumb";
import { Spinner } from "./ui/spinner";
import { ArrowLeftIcon } from "lucide-react";

export default function TicketView({ id }: { id?: string }) {
  const { data: ticket, isLoading } = trpc.ticket.get.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
        Loading...
      </div>
    );
  }

  if (!ticket && !!id) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Tasks
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="col-span-1">
        <TicketForm
          id={id}
          initial={
            ticket
              ? {
                  title: ticket.title,
                  description: ticket.description,
                  status: ticket.status.toString(),
                  priority: ticket.priority?.toString() || null,
                  assignedTo: ticket.assignedTo?.id || null,
                  startDate: ticket.startDate || null,
                  dueDate: ticket.dueDate || null,
                  createdAt: ticket.createdAt,
                  updatedAt: ticket.updatedAt,
                  tags: ticket.tags?.map((tag) => tag.id) || null,
                }
              : {
                  title: "",
                  description: "",
                  status: "0",
                  priority: null,
                  assignedTo: null,
                  startDate: null,
                  dueDate: null,
                  createdAt: null,
                  updatedAt: null,
                  tags: null,
                }
          }
        />
      </div>
      {id && (
        <div className="col-span-1 h-full">
          <TicketComments ticketId={id} />
        </div>
      )}

      {ticket && (
        <div className="col-span-2">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div>Created by: {ticket.createdBy?.name}</div>
            <div>Created at: {ticket.createdAt.toLocaleString()}</div>
            <div>Updated at: {ticket.updatedAt.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
