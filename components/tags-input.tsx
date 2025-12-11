import { trpc } from "@/trpc/client";
import {
  Tags,
  TagsValue,
  TagsTrigger,
  TagsContent,
  TagsInput,
  TagsList,
  TagsEmpty,
  TagsGroup,
  TagsItem,
} from "./kibo-ui/tags";
import { useState } from "react";
import { CheckIcon, PlusIcon } from "lucide-react";

export const CustomTagsInput = ({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
}) => {
  const [newTag, setNewTag] = useState<string>("");
  const utils = trpc.useUtils();
  const createTag = trpc.tag.create.useMutation();
  const { data: tags, isLoading } = trpc.tag.list.useQuery();

  const handleRemove = (toRemove: string) => {
    if (!value.includes(toRemove)) {
      return;
    }
    onValueChange(value.filter((v) => v !== toRemove));
  };

  const handleSelect = (toSelect: string) => {
    if (value.includes(toSelect)) {
      handleRemove(toSelect);
      return;
    }
    onValueChange([...value, toSelect]);
  };
  const handleCreateTag = () => {
    console.log(`created: ${newTag}`);
    createTag.mutate(
      { name: newTag },
      {
        onSuccess: (newTag) => {
          utils.tag.invalidate();
          onValueChange([...value, newTag.id]);
          setNewTag("");
        },
      }
    );
  };

  return (
    <Tags className="max-w-[300px]">
      <TagsTrigger>
        {value.map((tag) => (
          <TagsValue key={tag} onRemove={() => handleRemove(tag)}>
            {tags?.find((t) => t.id === tag)?.name}
          </TagsValue>
        ))}
      </TagsTrigger>
      <TagsContent>
        <TagsInput onValueChange={setNewTag} placeholder="Search tag..." />
        <TagsList>
          <TagsEmpty>
            <button
              className="mx-auto flex cursor-pointer items-center gap-2"
              onClick={handleCreateTag}
              type="button"
            >
              <PlusIcon className="text-muted-foreground" size={14} />
              Create new tag: {newTag}
            </button>
          </TagsEmpty>
          <TagsGroup>
            {tags?.map((tag) => (
              <TagsItem key={tag.id} onSelect={handleSelect} value={tag.id}>
                {tag.name}
                {value.includes(tag.id) && (
                  <CheckIcon className="text-muted-foreground" size={14} />
                )}
              </TagsItem>
            ))}
          </TagsGroup>
        </TagsList>
      </TagsContent>
    </Tags>
  );
};
