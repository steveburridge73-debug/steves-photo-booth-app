import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-lg bg-surface px-3 py-3 text-base text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
