import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, Sparkles } from "lucide-react";

import { signInWithGoogle } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
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
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <section className="w-full max-w-md">
        <Link className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" href="/">
          <ArrowLeft className="h-4 w-4" />
          Volver a Nexo
        </Link>

        <div className="nexo-floating rounded-[28px] p-6 sm:p-8">
          <div className="mb-7 text-center">
            <div className="nexo-surface mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl text-[var(--primary)]">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="font-display text-3xl font-bold text-[var(--primary)]">Nexo</p>
            <h1 className="mt-5 font-display text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
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
                <Button className="w-full" disabled={!backendReady} type="submit" variant="secondary">
                  <KeyRound className="h-4 w-4" />
                  Continuar con Google
                </Button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                <span className="h-px flex-1 bg-[var(--border)]" />
                o
                <span className="h-px flex-1 bg-[var(--border)]" />
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

export function EmailField() {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-bold">
        <Mail className="h-4 w-4 text-[var(--primary)]" />
        Correo electrónico
      </span>
      <Input autoComplete="email" name="email" placeholder="arian@nexo.app" required type="email" />
    </label>
  );
}
