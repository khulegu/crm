import { trpc } from "@/trpc/client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { MentionInput } from "./mention-input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

// Regex to match <userId> format
const MENTION_TAG_REGEX = /<([a-zA-Z0-9_-]+)>/g;

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export default function TicketComments({ ticketId }: { ticketId: string }) {
  const { data: comments, isLoading } = trpc.comment.list.useQuery({
    ticketId,
  });
  const { data: users } = trpc.user.list.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-sm font-bold">Comments</h2>
      <div className="flex flex-col gap-2 h-full max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {comments?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} users={users ?? []} />
        ))}
      </div>

      <CommentForm ticketId={ticketId} />
    </div>
  );
}

// Render comment body with highlighted mentions
// Parses <userId> format and displays as @Username with highlighting
function renderCommentBody(body: string, users: User[]) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(MENTION_TAG_REGEX);

  while ((match = regex.exec(body)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(body.slice(lastIndex, match.index));
    }

    const userId = match[1];
    const user = users.find((u) => u.id === userId);
    const displayName = user ? `@${user.name}` : match[0];

    // Add the highlighted mention
    parts.push(
      <span
        key={match.index}
        className="text-primary font-medium bg-primary/10 rounded px-1"
      >
        {displayName}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex));
  }

  return parts.length > 0 ? parts : body;
}

function CommentItem({
  comment,
  users,
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
  users: User[];
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
      <p className="text-sm">{renderCommentBody(comment.body, users)}</p>
      <p className="text-xs text-muted-foreground">
        {comment.createdAt.toLocaleString()}
      </p>
    </div>
  );
}

function CommentForm({ ticketId }: { ticketId: string }) {
  const { mutate: createComment, isPending } =
    trpc.comment.create.useMutation();
  const [body, setBody] = useState<string>("");
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const utils = trpc.useUtils();

  const handleMentionsChange = useCallback((ids: string[]) => {
    setMentionedUserIds(ids);
  }, []);

  const handleSubmit = () => {
    createComment(
      { ticketId, body, mentionedUserIds },
      {
        onSuccess: () => {
          setBody("");
          setMentionedUserIds([]);
          utils.comment.invalidate();
          toast.success("Comment added");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <MentionInput
        placeholder="Leave a comment... Use @ to mention users"
        value={body}
        onChange={setBody}
        onMentionsChange={handleMentionsChange}
      />
      <Button onClick={handleSubmit} disabled={isPending || !body.trim()}>
        {isPending ? "Posting..." : "Comment"}
      </Button>
    </div>
  );
}
