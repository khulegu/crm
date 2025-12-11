import { cn } from "@/lib/utils";

export function GhostInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-transparent outline-none",
        "border border-transparent rounded-md px-1 py-0.5",
        "focus:border-input focus:bg-background",
        "hover:bg-muted",
        "transition-colors",
        props.className
      )}
    />
  );
}
