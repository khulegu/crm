"use client";
import { trpc } from "@/trpc/client";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  body: string;
  isRead: boolean;
  type: string;
  ticketId: string;
  commentId: string | null;
  createdAt: Date;
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = trpc.notification.list.useQuery();
  return (
    <div>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex flex-col gap-4">
          {notifications?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const url = notification.commentId
    ? `/dashboard/ticket/${notification.ticketId}?commentId=${notification.commentId}`
    : `/dashboard/ticket/${notification.ticketId}`;
  return (
    <Link href={url}>
      <div className="border p-4 rounded-md hover:bg-muted">
        <div className="flex items-center gap-2">
          {notification.isRead ? (
            <CheckCircle className="size-4 text-green-500" />
          ) : (
            <Circle className="size-4 text-red-500" />
          )}
          <p className="font-bold">{notification.body}</p>
          <p className="text-sm text-muted-foreground">
            {notification.createdAt.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
