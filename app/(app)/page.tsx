import { AppShell } from "@/components/layout/app-shell";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (getOptionalSupabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims?.sub) {
      return <AuthRequired />;
    }
  }

  return <AppShell />;
}

function AuthRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <section className="nexo-floating max-w-md rounded-[28px] p-8 text-center">
        <p className="font-display text-3xl font-bold text-[var(--primary)]">Nexo</p>
        <h1 className="mt-6 font-display text-2xl font-bold">Inicia sesión para continuar</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Tu workspace ya está protegido por Supabase Auth cuando las variables de entorno están configuradas.
        </p>
        <a
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] nexo-primary-shadow"
          href="/login"
        >
          Ir a login
        </a>
      </section>
    </main>
  );
}
