import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "nexo-inset h-11 w-full rounded-2xl border border-transparent px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-soft)] focus:border-[var(--primary)] focus:outline-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
