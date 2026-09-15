import Link from "next/link";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

import { signInWithGoogle } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";

type AuthCardProps = {
  title: string;
  subtitle: string;
  message?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  showGoogle?: boolean;
};

export function AuthCard({ title, subtitle, message, children, footer, showGoogle = true }: AuthCardProps) {
  const backendReady = Boolean(getOptionalSupabasePublicEnv());

  return (
    <main className="auth-shell min-h-screen px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="auth-panel mx-auto w-full">
        <Link
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--primary)]"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Nexo
        </Link>

        <div className="auth-card rounded-[28px] p-5 sm:p-7">
          <div className="mb-6 text-center">
            <div className="auth-mark mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--primary)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="font-display text-3xl font-bold text-[var(--primary)]">Nexo</p>
            <h1 className="mt-4 font-display text-2xl font-bold leading-tight">{title}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
          </div>

          {!backendReady ? (
            <div className="mb-4 rounded-2xl bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--danger)]">
              Supabase todavía no está configurado en `.env.local`.
            </div>
          ) : null}

          {message ? (
            <div className="mb-4 rounded-2xl bg-[var(--primary-soft)] p-3 text-sm font-semibold text-[var(--primary-strong)]">
              {message}
            </div>
          ) : null}

          {showGoogle ? (
            <>
              <form action={signInWithGoogle}>
                <button className="auth-google-button" disabled={!backendReady} type="submit">
                  <GoogleLogo />
                  Continuar con Google
                </button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                <span className="h-px flex-1 bg-[var(--border)]" />o<span className="h-px flex-1 bg-[var(--border)]" />
              </div>
            </>
          ) : null}

          <div className="space-y-4">{children}</div>

          <div className="mt-6 text-center text-sm text-[var(--muted)]">{footer}</div>
        </div>
      </section>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.52Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.82-1.76-5.61-4.13H3.04v2.59A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.88A6.01 6.01 0 0 1 6.07 12c0-.65.11-1.28.32-1.88V7.53H3.04A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.04 4.47l3.35-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.99c1.47 0 2.8.51 3.84 1.5l2.86-2.86A9.61 9.61 0 0 0 12 2 9.99 9.99 0 0 0 3.04 7.53l3.35 2.59C7.18 7.75 9.4 5.99 12 5.99Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function EmailField() {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-bold">
        <Mail className="h-4 w-4 text-[var(--primary)]" />
        Correo electrónico
      </span>
      <Input autoComplete="email" className="auth-input" name="email" placeholder="arian@nexo.app" required type="email" />
    </label>
  );
}
