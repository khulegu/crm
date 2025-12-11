import {
  PRIORITY_LABEL,
  PRIORITY_VALUES,
  STATUS_LABEL,
  STATUS_VALUES,
} from "@/lib/schema";
import { trpc } from "@/trpc/client";
import {
  IconCircleCheckFilled,
  IconClock,
  IconClockFilled,
  IconLoader,
} from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function StatusBadge(
  props: React.ComponentProps<typeof Badge> & {
    status: keyof typeof STATUS_LABEL;
  }
) {
  return (
    <Badge {...props} className="bg-background text-foreground">
      {props.status === 2 ? (
        <IconCircleCheckFilled className="fill-green-500" />
      ) : props.status === 1 ? (
        <IconClockFilled className="fill-yellow-500" />
      ) : (
        <IconLoader />
      )}
      {STATUS_LABEL[props.status]}
    </Badge>
  );
}

export function PriorityBadge(
  props: React.ComponentProps<typeof Badge> & {
    priority: keyof typeof PRIORITY_LABEL;
  }
) {
  const COLOR_MAP = {
    0: "bg-gray-500",
    1: "bg-green-500",
    2: "bg-yellow-500",
    3: "bg-red-500",
  };
  return (
    <Badge
      {...props}
      className={COLOR_MAP[props.priority as keyof typeof COLOR_MAP]}
    >
      {PRIORITY_LABEL[props.priority]}
    </Badge>
  );
}

export function PrioritySelect(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Priority</SelectLabel>
          {PRIORITY_VALUES.map((priority: number) => (
            <SelectItem key={priority} value={priority.toString()}>
              <PriorityBadge
                priority={priority as keyof typeof PRIORITY_LABEL}
              />
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
              <StatusBadge status={status as keyof typeof STATUS_LABEL} />
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
