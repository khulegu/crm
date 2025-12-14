"use client";

import { TicketKanban } from "@/components/ticket-kanban";
import { TickedTableDataLoader } from "@/components/ticket-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <>
      <Tabs defaultValue="table">
        <div className="flex gap-2">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="kanban">
          <TicketKanban />
        </TabsContent>
        <TabsContent value="table">
          <TickedTableDataLoader />
        </TabsContent>
      </Tabs>
    </>
  );
}
