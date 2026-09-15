import { Bell, CheckCircle2, FileText, Plus, Search, Timer } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardTasks, mobileNavigationItems, recentNotes, spaces } from "@/lib/mock/nexo";

export function MobileAppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <header className="safe-top sticky top-0 z-30 flex h-20 items-center justify-between bg-[var(--surface)] px-4 shadow-[0_4px_16px_var(--shadow-dark-soft)]">
        <div className="flex items-center gap-3">
          <div className="nexo-surface-sm flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
            <Image alt="Nexo" height={24} src="/icons/nexo-mark.svg" width={24} />
          </div>
          <p className="font-display text-2xl font-bold tracking-normal text-[var(--primary)]">Nexo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button aria-label="Buscar en Nexo" size="icon" variant="secondary">
            <Search aria-hidden className="h-5 w-5" />
          </Button>
          <Button aria-label="Notificaciones" size="icon" variant="secondary">
            <Bell aria-hidden className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-5 px-4 pt-5">
        <section className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-normal">Buenas tardes, Arian</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Esto es lo que tienes para hoy.</p>
          </div>
          <div className="nexo-inset shrink-0 rounded-full px-3 py-1 text-[0.68rem] font-bold text-[var(--muted)]">
            Sincronizado
          </div>
        </section>

        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--border)_40%,transparent)] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[var(--primary)]">●</span>
              <p className="text-sm font-bold">Miércoles, 26 de febrero</p>
            </div>
            <span className="nexo-inset rounded-lg px-2 py-0.5 text-xs font-bold text-[var(--primary)]">3 pendientes</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Sprint review</p>
              <p className="mt-1 text-sm text-[var(--muted)]">6:30 PM · Google Meet</p>
            </div>
            <Button size="sm">Unirse</Button>
          </div>
        </Card>

        <section className="-mx-4 flex gap-3 overflow-x-auto px-4 py-1">
          {["Nueva nota", "Tarea", "Subir archivo", "Iniciar Focus"].map((action) => (
            <Button className="shrink-0" key={action} size="sm">
              <Plus aria-hidden className="h-4 w-4" />
              {action}
            </Button>
          ))}
        </section>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 aria-hidden className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-display text-lg font-bold">Mis tareas</h2>
            </div>
            <button className="text-sm font-semibold text-[var(--primary)]">Ver todas</button>
          </div>
          <div className="space-y-3">
            {dashboardTasks.slice(0, 2).map((task) => (
              <div className="nexo-surface-sm flex gap-3 rounded-2xl p-3" key={task.title}>
                <span className="nexo-inset mt-1 h-5 w-5 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{task.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {task.space} · {task.due}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <FileText aria-hidden className="h-5 w-5 text-[var(--primary)]" />
              Notas recientes
            </h2>
            <button className="text-sm font-semibold text-[var(--primary)]">Explorar</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recentNotes.map((note) => (
              <Card className="flex h-36 flex-col justify-between p-3.5" key={note.title}>
                <div>
                  <p className="text-xs font-bold text-[var(--primary)]">{note.space}</p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug">{note.title}</h3>
                </div>
                <p className="line-clamp-2 text-xs text-[var(--muted)]">{note.excerpt}</p>
              </Card>
            ))}
          </div>
        </section>

        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="nexo-inset flex h-12 w-12 items-center justify-center rounded-full text-[var(--primary)]">
              <Timer aria-hidden className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">25:00</p>
              <p className="text-sm text-[var(--muted)]">14.5 h acumuladas esta semana</p>
            </div>
          </div>
          <Button aria-label="Iniciar Focus" size="icon" variant="primary">
            <Plus aria-hidden className="h-5 w-5" />
          </Button>
        </Card>

        <section className="space-y-3">
          <h2 className="px-1 font-display text-lg font-bold">Tus espacios</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {spaces.map((space) => (
              <Button className="shrink-0" key={space.name}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: space.color }} />
                {space.name}
                <span className="text-xs text-[var(--muted)]">{space.count}</span>
              </Button>
            ))}
          </div>
        </section>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[420px] items-center justify-around rounded-t-3xl bg-[var(--surface)] px-2 pt-2 shadow-[0_-4px_20px_var(--shadow-dark-soft)]">
        {mobileNavigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = index === 0;
          const create = item.label === "Crear";

          return (
            <a
              className={
                active
                  ? "flex flex-col items-center justify-center rounded-2xl bg-[var(--primary)] px-3 py-1 text-[var(--primary-foreground)] shadow-[2px_2px_6px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                  : create
                    ? "-mt-6 flex flex-col items-center justify-center text-[var(--primary)]"
                    : "flex flex-col items-center justify-center px-3 py-1 text-[var(--muted)]"
              }
              href={item.href}
              key={item.label}
            >
              <span
                className={
                  create
                    ? "nexo-primary-shadow mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : undefined
                }
              >
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="mt-0.5 text-[0.68rem] font-bold">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
