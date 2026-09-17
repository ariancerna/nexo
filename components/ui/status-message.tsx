import { CheckCircle2 } from "lucide-react";

export function StatusMessage({ tone, text }: { tone: "success" | "error"; text: string }) {
  return (
    <div
      className={
        tone === "success"
          ? "flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,#059669_12%,var(--surface))] p-3 text-sm font-semibold text-[#047857]"
          : "rounded-xl bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--danger)]"
      }
      role="status"
    >
      {tone === "success" ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : null}
      {text}
    </div>
  );
}
