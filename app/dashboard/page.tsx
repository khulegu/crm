"use client";

import { TicketTable } from "@/components/ticket-table";

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Tasks</h1>
      <TicketTable />
    </>
  );
}
