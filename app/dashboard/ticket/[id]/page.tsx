"use client";

import TicketView from "@/components/ticket-view";
import { use } from "react";

export default function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TicketView id={id} />;
}
