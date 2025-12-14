"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRIORITY, PRIORITY_LABEL, STATUS, STATUS_LABEL } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  MoreHorizontal,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { PriorityBadge, StatusBadge } from "./custom-selects";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";

type Ticket = {
  id: string;
  title: string;
  status: keyof typeof STATUS_LABEL;
  priority: keyof typeof PRIORITY_LABEL | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    image: string | null;
  };
  assignedTo: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  updatedAt: Date;
  startDate: Date | null;
  dueDate: Date | null;
  tags: {
    id: string;
    name: string;
  }[];
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/ticket/${row.original.id}`}
        className="hover:underline font-medium"
      >
        {row.getValue("title")}
      </Link>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof STATUS_LABEL;
      return <StatusBadge status={status} />;
    },
    enableSorting: true,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as keyof typeof PRIORITY_LABEL;
      return <PriorityBadge priority={priority} />;
    },
    enableSorting: true,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as Ticket["tags"];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="default">
              {tag.name}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.getValue("createdBy") as Ticket["createdBy"];
      return (
        <HoverCard>
          <HoverCardTrigger>
            <Avatar>
              <AvatarImage src={createdBy?.image ?? undefined} />
              <AvatarFallback>{createdBy?.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent>{createdBy?.name}</HoverCardContent>
        </HoverCard>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.getValue("assignedTo") as Ticket["assignedTo"];
      return (
        <HoverCard>
          <HoverCardTrigger>
            <Avatar>
              <AvatarImage src={assignedTo?.image ?? undefined} />
              <AvatarFallback>{assignedTo?.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent>{assignedTo?.name}</HoverCardContent>
        </HoverCard>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;
      return <div className="capitalize">{createdAt.toLocaleDateString()}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as Date | null;
      return (
        <div className="capitalize">{startDate?.toLocaleDateString()}</div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as Date | null;
      return <div className="capitalize">{dueDate?.toLocaleDateString()}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
            >
              Copy ticket ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View ticket</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function TickedTableDataLoader() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);

  const { data, isFetching } = trpc.ticket.list.useQuery(
    {
      sorting,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      status: statusFilter,
      priority: priorityFilter,
    },
    {
      /** keeps the previous state when new one is loading */
      placeholderData: (previousData) => previousData,
    }
  );

  if (!data) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  return (
    <TicketTable
      tickets={data.tickets}
      totalCount={data.totalCount}
      sorting={sorting}
      setSorting={setSorting}
      pagination={pagination}
      setPagination={setPagination}
      isFetching={isFetching}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      priorityFilter={priorityFilter}
      setPriorityFilter={setPriorityFilter}
    />
  );
}

export function TicketTable({
  tickets,
  totalCount,
  sorting,
  setSorting,
  pagination,
  setPagination,
  isFetching,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}: {
  tickets: Ticket[];
  totalCount: number;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: OnChangeFn<{
    pageIndex: number;
    pageSize: number;
  }>;
  isFetching: boolean;
  statusFilter: number | null;
  setStatusFilter: (value: number | null) => void;
  priorityFilter: number | null;
  setPriorityFilter: (value: number | null) => void;
}) {
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: tickets ?? [],
    columns,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <Input
          placeholder="Search..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Select
          value={statusFilter?.toString() ?? "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? null : parseInt(value))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={STATUS.OPEN.toString()}>
              {STATUS_LABEL[STATUS.OPEN]}
            </SelectItem>
            <SelectItem value={STATUS.IN_PROGRESS.toString()}>
              {STATUS_LABEL[STATUS.IN_PROGRESS]}
            </SelectItem>
            <SelectItem value={STATUS.CLOSED.toString()}>
              {STATUS_LABEL[STATUS.CLOSED]}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter?.toString() ?? "all"}
          onValueChange={(value) =>
            setPriorityFilter(value === "all" ? null : parseInt(value))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value={PRIORITY.LOW.toString()}>
              {PRIORITY_LABEL[PRIORITY.LOW]}
            </SelectItem>
            <SelectItem value={PRIORITY.MEDIUM.toString()}>
              {PRIORITY_LABEL[PRIORITY.MEDIUM]}
            </SelectItem>
            <SelectItem value={PRIORITY.HIGH.toString()}>
              {PRIORITY_LABEL[PRIORITY.HIGH]}
            </SelectItem>
            <SelectItem value={PRIORITY.URGENT.toString()}>
              {PRIORITY_LABEL[PRIORITY.URGENT]}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button asChild variant="default" className="ml-auto">
          <Link href="/dashboard/ticket/create">
            <PlusIcon className="h-4 w-4" />
            Create Ticket
          </Link>
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-md border">
        {isFetching && (
          <div className="absolute inset-0 top-[44px] z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading...</span>
            </div>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
                    >
                      {header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
