import { trpc } from "@/trpc/client";

export const TicketTable = () => {
  const { data, isLoading } = trpc.ticket.list.useQuery();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};