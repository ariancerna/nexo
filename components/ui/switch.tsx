import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  checked?: boolean;
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, className, ...props }, ref) => {
    return (
      <button
        aria-checked={checked}
        className={cn(
          "nexo-inset inline-flex h-7 w-13 items-center rounded-full p-1 transition",
          checked && "bg-[color-mix(in_srgb,var(--primary)_18%,var(--surface-container-low))]",
          className,
        )}
        ref={ref}
        role="switch"
        type="button"
        {...props}
      >
        <span
          className={cn(
            "nexo-surface-sm block h-5 w-5 rounded-full transition-transform",
            checked && "translate-x-6 bg-[var(--primary)]",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
