import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full shadow-[var(--shadow-border)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-elevated",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-5 rounded-full bg-fg transition-transform duration-150 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 data-[state=checked]:bg-accent-fg",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
