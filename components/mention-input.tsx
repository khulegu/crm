"use client";

import { trpc } from "@/trpc/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Textarea } from "./ui/textarea";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentionedUserIds: string[]) => void;
  placeholder?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// Regex to match <userId> format
const MENTION_TAG_REGEX = /<([a-zA-Z0-9_-]+)>/g;

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder,
}: MentionInputProps) {
  const { data: users } = trpc.user.list.useQuery();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null
  );

  // Convert raw value (with <userId>) to display value (with @Username)
  const displayValue = useMemo(() => {
    if (!users) return value;
    return value.replace(MENTION_TAG_REGEX, (match, userId) => {
      const user = users.find((u) => u.id === userId);
      return user ? `@${user.name}` : match;
    });
  }, [value, users]);

  // Convert display value back to raw value (with <userId>)
  const displayToRaw = useCallback(
    (display: string, currentRaw: string): string => {
      if (!users) return display;

      // Build a map of current mentions in raw format
      const rawMentions: { userId: string; name: string }[] = [];
      let match;
      const regex = new RegExp(MENTION_TAG_REGEX);
      while ((match = regex.exec(currentRaw)) !== null) {
        const user = users.find((u) => u.id === match[1]);
        if (user) {
          rawMentions.push({ userId: user.id, name: user.name });
        }
      }

      // Replace @Username with <userId> for known mentions
      let result = display;
      for (const mention of rawMentions) {
        const displayMention = `@${mention.name}`;
        const rawMention = `<${mention.userId}>`;
        result = result.replace(displayMention, rawMention);
      }

      return result;
    },
    [users]
  );

  // Extract mentioned user IDs from the raw text
  const extractMentionedUserIds = useCallback((text: string): string[] => {
    const mentionedIds: string[] = [];
    let match;
    const regex = new RegExp(MENTION_TAG_REGEX);

    while ((match = regex.exec(text)) !== null) {
      const userId = match[1];
      if (!mentionedIds.includes(userId)) {
        mentionedIds.push(userId);
      }
    }

    return mentionedIds;
  }, []);

  // Update mentioned users when value changes
  useEffect(() => {
    const mentionedIds = extractMentionedUserIds(value);
    onMentionsChange(mentionedIds);
  }, [value, extractMentionedUserIds, onMentionsChange]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!mentionSearch) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [users, mentionSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplayValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    setCursorPosition(newCursorPosition);

    // Convert display value back to raw value
    const newRawValue = displayToRaw(newDisplayValue, value);
    onChange(newRawValue);

    // Check if we should show mentions popup
    const textBeforeCursor = newDisplayValue.slice(0, newCursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      // Check if @ is at start or preceded by whitespace
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : " ";
      if (charBeforeAt === " " || charBeforeAt === "\n" || atIndex === 0) {
        const searchText = textBeforeCursor.slice(atIndex + 1);
        // Only show if there's no space after the search started (single word search)
        if (!searchText.includes(" ") || searchText.length === 0) {
          setMentionStartIndex(atIndex);
          setMentionSearch(searchText);
          setShowMentions(true);
          return;
        }
      }
    }

    setShowMentions(false);
    setMentionStartIndex(null);
    setMentionSearch("");
  };

  const handleSelectUser = (user: User) => {
    if (mentionStartIndex === null) return;

    // Work with display value for cursor positioning
    const currentDisplay = displayValue;
    const beforeMention = currentDisplay.slice(0, mentionStartIndex);
    const afterMention = currentDisplay.slice(cursorPosition);

    // Build new display value with @Username
    const newDisplayValue = `${beforeMention}@${user.name} ${afterMention}`;

    // Convert to raw value with <userId>
    const beforeMentionRaw = displayToRaw(beforeMention, value);
    const afterMentionRaw = displayToRaw(afterMention, value);
    const newRawValue = `${beforeMentionRaw}<${user.id}> ${afterMentionRaw}`;

    onChange(newRawValue);
    setShowMentions(false);
    setMentionStartIndex(null);
    setMentionSearch("");

    // Focus back on textarea and set cursor position (using display value positions)
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartIndex + user.name.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentions(false);
      } else if (e.key === "Enter" && filteredUsers.length > 0) {
        e.preventDefault();
        handleSelectUser(filteredUsers[0]);
      }
    }
  };

  return (
    <Popover open={showMentions} onOpenChange={setShowMentions}>
      <PopoverAnchor asChild>
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup heading="Users">
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelectUser(user)}
                  className="cursor-pointer"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
