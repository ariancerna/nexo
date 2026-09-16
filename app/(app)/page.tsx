import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, FolderOpen, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const features = [
  {
    icon: FileText,
    title: "Notas conectadas",
    description: "Centraliza ideas, decisiones y documentación sin perder el contexto de cada proyecto.",
  },
  {
    icon: CheckCircle2,
    title: "Tareas accionables",
    description: "Convierte planes en listas claras, con prioridades y espacios separados por área.",
  },
  {
    icon: FolderOpen,
    title: "Archivos organizados",
    description: "Guarda recursos importantes y mantén su metadata sincronizada con tu workspace.",
  },
  {
    icon: CalendarDays,
    title: "Agenda y foco",
    description: "Une calendario, sesiones de concentración y pendientes en una misma vista diaria.",
  },
];

const pillars = ["PWA instalable", "Supabase Auth", "Workspace privado", "Diseño responsive"];

export default async function HomePage() {
  if (getOptionalSupabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getClaims();

    if (data?.claims?.sub) {
      const { data: profile } = await supabase.from("profiles").select("full_name").maybeSingle();
      const email = typeof data.claims.email === "string" ? data.claims.email : "";

      return (
        <AppShell
          user={{
            email,
            name: profile?.full_name || email.split("@")[0] || "Usuario Nexo",
          }}
        />
      );
    }
  }

  return <LandingPage />;
}

function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section
        className="relative flex min-h-[92vh] items-center overflow-hidden px-5 py-6 sm:px-6 lg:px-8"
        data-testid="landing-hero"
      >
        <Image
          alt="Workspace digital organizado en Nexo"
          className="absolute inset-0 h-full w-full object-cover"
          data-testid="landing-hero-image"
          height={1080}
          priority
          src="/images/nexo-hero.png"
          width={1920}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,25,0.96)_0%,rgba(11,15,25,0.82)_42%,rgba(11,15,25,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--background))]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col" data-testid="landing-hero-content">
          <header className="flex items-center justify-between py-2">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_14px_30px_rgba(67,56,202,0.22)]">
                <Image alt="Nexo" height={28} src="/icons/nexo-mark.svg" width={28} />
              </span>
              <span>
                <span className="block font-display text-2xl font-bold text-white">Nexo</span>
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-white/55">Personal hub</span>
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white sm:inline-flex"
                href="/login"
              >
                Iniciar sesión
              </Link>
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#111827] shadow-[0_16px_36px_rgba(255,255,255,0.14)] transition hover:bg-[#f8fafd]"
                href="/register"
              >
                Crear cuenta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </header>

          <div className="max-w-3xl pb-20 pt-24 sm:pt-28 lg:pb-24 lg:pt-36">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white/72 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#93c5fd]" />
              Organiza tu vida digital
            </div>
            <h1 className="mt-6 max-w-2xl font-display text-5xl font-black leading-tight text-white sm:text-7xl">
              Nexo
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
              Un hub personal para reunir notas, tareas, archivos, agenda y espacios en una sola experiencia clara,
              privada y lista para trabajar todos los días.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--primary-foreground)] nexo-primary-shadow transition hover:brightness-105"
                href="/register"
              >
                Empezar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/18 bg-white/9 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/14"
                href="/login"
              >
                Ya tengo cuenta
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-sm font-semibold text-white/64">
              {pillars.map((pillar) => (
                <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1 backdrop-blur-md" key={pillar}>
                  {pillar}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Qué resuelve</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
              Menos pestañas abiertas. Más claridad para avanzar.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Nexo está diseñado para personas que necesitan capturar, ordenar y ejecutar sin partir su información
              entre cinco herramientas distintas.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="nexo-surface-sm rounded-3xl p-5" key={feature.title}>
                  <div className="nexo-inset flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[28px] bg-[var(--surface)] p-6 shadow-[0_20px_55px_var(--shadow-dark-soft)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Arquitectura preparada</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight">Funcional por diseño, no sólo bonito.</h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              La interfaz ya está conectada a Supabase para autenticación, perfil, datos del workspace y storage. La
              landing mantiene la entrada pública, mientras el espacio privado se abre sólo con sesión activa.
            </p>
          </div>
          <div className="rounded-[28px] bg-[var(--primary)] p-6 text-[var(--primary-foreground)] shadow-[0_20px_55px_color-mix(in_srgb,var(--primary)_28%,transparent)] sm:p-8">
            <ShieldCheck className="h-9 w-9" />
            <h3 className="mt-5 font-display text-2xl font-black">Privado por defecto</h3>
            <p className="mt-3 text-sm leading-6 opacity-80">
              Cada cuenta entra a su propio workspace. La home presenta el producto; el dashboard queda reservado para
              usuarios autenticados.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#111827]"
              href="/register"
            >
              Crear mi espacio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
