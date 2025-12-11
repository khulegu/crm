import { trpc } from "@/trpc/client";
import TicketForm from "./ticket-form";
import TicketComments from "./ticket-comments";

export default function TicketFormLoader({ id }: { id?: string }) {
  const { data: ticket, isLoading } = trpc.ticket.get.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!ticket && !!id) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="w-full grid grid-cols-2">
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
                  createdAt: ticket.createdAt,
                  updatedAt: ticket.updatedAt,
                }
              : {
                  title: "",
                  description: "",
                  status: "",
                  priority: null,
                  assignedTo: null,
                  createdAt: null,
                  updatedAt: null,
                }
          }
        />
      </div>
      {id && (
        <div className="col-span-1">
          <TicketComments ticketId={id} />
        </div>
      )}

      <div className="col-span-2">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div>Created by: {ticket?.createdBy?.name}</div>
          <div>Created at: {ticket?.createdAt.toLocaleString()}</div>
          <div>Updated at: {ticket?.updatedAt.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
