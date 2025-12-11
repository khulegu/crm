"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/trpc/client";

export default function MembersPage() {
  const { data: members, isLoading } = trpc.user.list.useQuery();
  return (
    <div>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Members</h1>
        <div className="flex flex-col gap-4">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold">{member.name}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
