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
          "inline-flex h-7 w-13 shrink-0 items-center rounded-full border p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          checked
            ? "border-transparent bg-[var(--primary)] shadow-[inset_2px_2px_5px_color-mix(in_srgb,var(--primary-strong)_65%,transparent)]"
            : "border-[var(--border)] bg-[var(--surface-container-high)] shadow-[inset_2px_2px_5px_var(--shadow-dark)]",
          className,
        )}
        data-state={checked ? "checked" : "unchecked"}
        ref={ref}
        role="switch"
        type="button"
        {...props}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full border transition-transform duration-200",
            checked
              ? "translate-x-6 border-white/70 bg-white shadow-sm"
              : "translate-x-0 border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
