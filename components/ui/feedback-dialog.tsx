"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

export type FeedbackDialogState = {
  title: string;
  description: string;
  variant: "danger" | "info";
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
};

export function FeedbackDialog({
  dialog,
  onClose,
}: {
  dialog: FeedbackDialogState | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dialog) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [dialog, onClose]);

  if (!dialog || typeof document === "undefined") return null;

  const Icon = dialog.variant === "danger" ? AlertTriangle : Info;

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="nexo-floating w-full max-w-md rounded-2xl border border-[var(--border)] p-5"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={
              dialog.variant === "danger"
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-strong)]"
            }
          >
            <Icon aria-hidden className="h-5 w-5" />
          </div>
          <Button aria-label="Cerrar" onClick={onClose} ref={closeButtonRef} size="icon" variant="ghost">
            <X aria-hidden className="h-5 w-5" />
          </Button>
        </div>
        <h2 className="mt-4 font-display text-xl font-bold" id={titleId}>
          {dialog.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]" id={descriptionId}>
          {dialog.description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          {dialog.onConfirm ? <Button onClick={onClose}>Cancelar</Button> : null}
          <Button
            className={
              dialog.variant === "danger"
                ? "bg-[var(--danger)] text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--danger)_28%,transparent)] hover:brightness-105"
                : undefined
            }
            onClick={() => {
              const action = dialog.onConfirm;
              onClose();
              void action?.();
            }}
            variant="primary"
          >
            {dialog.confirmLabel ?? "Entendido"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
