"use client";

import TicketFormLoader from "@/components/ticket-edit-loader";
import { use } from "react";

export default function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TicketFormLoader id={id} />;
}
