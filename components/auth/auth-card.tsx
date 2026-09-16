import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { signInWithGoogle, signInWithMicrosoft } from "@/app/auth/actions";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";

type AuthCardProps = {
  title: string;
  subtitle: string;
  message?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  showSocial?: boolean;
  socialLayout?: "stacked" | "split";
};

export function AuthCard({
  title,
  subtitle,
  message,
  children,
  footer,
  showSocial = true,
  socialLayout = "stacked",
}: AuthCardProps) {
  const backendReady = Boolean(getOptionalSupabasePublicEnv());

  return (
    <main className="auth-page relative flex min-h-svh flex-col overflow-hidden px-4 py-5 text-[var(--foreground)] sm:px-8 sm:py-7">
      <header className="relative z-10 flex items-center justify-between">
        <Link className="auth-brand" href="/" aria-label="Ir al inicio de Nexo">
          <span className="auth-brand-mark">
            <Image alt="" height={24} src="/icons/nexo-mark.svg" width={24} />
          </span>
          <span>
            <span className="block font-display text-lg font-extrabold leading-none text-[var(--primary)]">Nexo</span>
            <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Personal hub
            </span>
          </span>
        </Link>
        <Link aria-label="Volver al inicio" className="auth-back" href="/">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full flex-1 items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-[410px]">
          <div className="auth-card rounded-[20px] px-5 py-7 sm:px-7 sm:py-8">
            <div className="text-center">
              <div className="auth-mark mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
                <Image alt="Nexo" height={28} src="/icons/nexo-mark.svg" width={28} />
              </div>
              <h1 className="mt-5 font-display text-2xl font-extrabold leading-tight">{title}</h1>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
            </div>

            {!backendReady ? (
              <div className="mt-5 rounded-xl bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--danger)]">
                El servicio de acceso no está disponible en este momento.
              </div>
            ) : null}

            {message ? (
              <div className="mt-5 rounded-xl bg-[var(--primary-soft)] p-3 text-sm font-semibold text-[var(--primary-strong)]">
                {message}
              </div>
            ) : null}

            {showSocial ? (
              <>
                <div className={socialLayout === "split" ? "mt-6 grid grid-cols-2 gap-3" : "mt-6 space-y-3"}>
                  <form action={signInWithGoogle}>
                    <button className="auth-provider-button" disabled={!backendReady} type="submit">
                      <GoogleLogo />
                      <span>{socialLayout === "split" ? "Google" : "Continuar con Google"}</span>
                    </button>
                  </form>
                  <form action={signInWithMicrosoft}>
                    <button className="auth-provider-button" disabled={!backendReady} type="submit">
                      <MicrosoftLogo />
                      <span>{socialLayout === "split" ? "Microsoft" : "Continuar con Microsoft"}</span>
                    </button>
                  </form>
                </div>
                <div className="my-5 flex items-center gap-3 text-xs font-medium text-[var(--muted-soft)]">
                  <span className="h-px flex-1 bg-[var(--border)]" />
                  <span>{socialLayout === "split" ? "o regístrate con tu correo" : "o con tu correo electrónico"}</span>
                  <span className="h-px flex-1 bg-[var(--border)]" />
                </div>
              </>
            ) : null}

            <div className={showSocial ? "" : "mt-6"}>{children}</div>

            <div className="mt-6 border-t border-[var(--border)] pt-5 text-center text-sm text-[var(--muted)]">
              {footer}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium text-[var(--muted)]">
            <ShieldCheck aria-hidden className="h-4 w-4 text-[var(--primary)]" />
            Conexión segura y datos privados
          </div>
        </div>
      </section>

      <footer className="relative z-10 hidden items-center justify-between text-xs text-[var(--muted-soft)] sm:flex">
        <span>Nexo Personal Hub</span>
        <span>Organiza tu espacio con calma.</span>
      </footer>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.52Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.82-1.76-5.61-4.13H3.04v2.59A9.99 9.99 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.39 13.88A6.01 6.01 0 0 1 6.07 12c0-.65.11-1.28.32-1.88V7.53H3.04A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.04 4.47l3.35-2.59Z" fill="#FBBC05" />
      <path d="M12 5.99c1.47 0 2.8.51 3.84 1.5l2.86-2.86A9.61 9.61 0 0 0 12 2 9.99 9.99 0 0 0 3.04 7.53l3.35 2.59C7.18 7.75 9.4 5.99 12 5.99Z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <span aria-hidden className="grid h-4 w-4 shrink-0 grid-cols-2 gap-px">
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  );
}

export function EmailField({ label = "Correo electrónico" }: { label?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold">{label}</span>
      <span className="auth-input-wrap">
        <Mail aria-hidden className="auth-input-icon" />
        <input
          autoComplete="email"
          className="auth-native-input"
          name="email"
          placeholder="nombre@ejemplo.com"
          required
          type="email"
        />
      </span>
    </label>
  );
}
