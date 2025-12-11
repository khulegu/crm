"use client";

import { DevTool } from "@hookform/devtools";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PRIORITY_LABEL,
  PRIORITY_VALUES,
  STATUS_LABEL,
  STATUS_VALUES,
} from "@/lib/schema";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const ticketFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(STATUS_VALUES.map(String)),
  priority: z.enum(PRIORITY_VALUES.map(String)).nullable(),
  assignedTo: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export default function TicketForm({
  id,
  initial,
}: {
  id?: string;
  initial?: z.infer<typeof ticketFormSchema>;
}) {
  const router = useRouter();

  const createTicket = trpc.ticket.create.useMutation();
  const updateTicket = trpc.ticket.update.useMutation();
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    values: initial,
  });

  const onSubmit = (data: z.infer<typeof ticketFormSchema>) => {
    const body = {
      title: data.title,
      description: data.description,
      status: parseInt(data.status),
      priority: data.priority ? parseInt(data.priority) : null,
      assignedTo: data.assignedTo,
    };

    if (id) {
      updateTicket.mutate(
        { id, ...body },
        {
          onSuccess: () => {
            utils.ticket.list.invalidate();
            router.push("/dashboard");
          },
          onError: (error) => {
            console.error(error);
          },
        }
      );
      utils.ticket.list.invalidate();
    } else {
      console.log("Creating ticket");
      createTicket.mutate(body, {
        onSuccess: () => {
          utils.ticket.list.invalidate();
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error(error);
        },
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="font-bold"
                      placeholder="Title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-48"
                      placeholder="Description"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          {STATUS_VALUES.map((status) => (
                            <SelectItem key={status} value={status.toString()}>
                              {
                                STATUS_LABEL[
                                  status as keyof typeof STATUS_LABEL
                                ]
                              }
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Priority</SelectLabel>
                          {PRIORITY_VALUES.map((priority: number) => (
                            <SelectItem
                              key={priority}
                              value={priority.toString()}
                            >
                              {
                                PRIORITY_LABEL[
                                  priority as keyof typeof PRIORITY_LABEL
                                ]
                              }
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </Form>
    </div>
  );
}
