import { trpc } from "@/trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function TicketComments({ ticketId }: { ticketId: string }) {
  const { data: comments, isLoading } = trpc.comment.list.useQuery({
    ticketId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-sm font-bold">Comments</h2>
      <div className="flex flex-col gap-2 h-full max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {comments?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      <CommentForm ticketId={ticketId} />
    </div>
  );
}

function CommentItem({
  comment,
}: {
  comment: {
    id: string;
    body: string;
    createdBy: {
      id: string;
      name: string;
      image: string | null;
    };
    createdAt: Date;
  };
}) {
  return (
    <div className="flex flex-col gap-2 bg-muted/50 p-2 rounded-md">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={comment.createdBy.image ?? undefined} />
          <AvatarFallback>{comment.createdBy.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="text-xs font-semibold">{comment.createdBy.name}</p>
      </div>
      <p className="text-sm">{comment.body}</p>
      <p className="text-xs text-muted-foreground">
        {comment.createdAt.toLocaleString()}
      </p>
    </div>
  );
}

function CommentForm({ ticketId }: { ticketId: string }) {
  const { mutate: createComment } = trpc.comment.create.useMutation();
  const [body, setBody] = useState<string>("");
  const utils = trpc.useUtils();

  const handleSubmit = () => {
    createComment(
      { ticketId, body },
      {
        onSuccess: () => {
          setBody("");
          utils.comment.invalidate();
          toast.success("Comment added");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Leave a comment..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Button onClick={handleSubmit}>Comment</Button>
    </div>
  );
}
