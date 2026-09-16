"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useId, useState } from "react";

export function PasswordField({
  label = "Contraseña",
  name = "password",
  autoComplete = "current-password",
  placeholder = "Mínimo 8 caracteres",
  showForgot = false,
}: {
  label?: string;
  name?: string;
  autoComplete?: "current-password" | "new-password";
  placeholder?: string;
  showForgot?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="block space-y-2">
      <span className="flex items-center justify-between gap-3 text-xs font-bold">
        <label htmlFor={inputId}>{label}</label>
        {showForgot ? (
          <Link className="text-[var(--primary)] hover:underline" href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        ) : null}
      </span>
      <span className="auth-input-wrap">
        <LockKeyhole aria-hidden className="auth-input-icon" />
        <input
          autoComplete={autoComplete}
          className="auth-native-input pr-11"
          id={inputId}
          minLength={8}
          name={name}
          placeholder={placeholder}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
        </button>
      </span>
    </div>
  );
}
