import { PRIORITY_LABEL, STATUS_LABEL, STATUS_VALUES } from "@/lib/schema";
import { PRIORITY_VALUES } from "@/lib/schema";
import {
  Select,
  SelectLabel,
  SelectGroup,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import { trpc } from "@/trpc/client";

export function PrioritySelect(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Priority</SelectLabel>
          {PRIORITY_VALUES.map((priority: number) => (
            <SelectItem key={priority} value={priority.toString()}>
              {PRIORITY_LABEL[priority as keyof typeof PRIORITY_LABEL]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
      <SelectTrigger>
        <SelectValue placeholder="Select Priority" />
      </SelectTrigger>
    </Select>
  );
}

export function StatusSelect(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          {STATUS_VALUES.map((status) => (
            <SelectItem key={status} value={status.toString()}>
              {STATUS_LABEL[status as keyof typeof STATUS_LABEL]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
      <SelectTrigger>
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>
    </Select>
  );
}

export function UserSelect(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <UserSelectContent />
      <SelectTrigger>
        <SelectValue placeholder="Select User" />
      </SelectTrigger>
    </Select>
  );
}

function UserSelectContent() {
  const { data: users, isLoading } = trpc.user.list.useQuery();

  if (isLoading) {
    return (
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Loading...</SelectLabel>
        </SelectGroup>
      </SelectContent>
    );
  }

  return (
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Users</SelectLabel>
        {users?.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  );
}
