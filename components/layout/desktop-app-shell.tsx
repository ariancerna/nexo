import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTasks, navigationItems, recentNotes, spaces } from "@/lib/mock/nexo";

export function DesktopAppShell() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col justify-between bg-[var(--surface)] p-4 shadow-[6px_0_16px_var(--shadow-dark-soft)]">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="nexo-surface flex h-10 w-10 items-center justify-center rounded-2xl">
              <Image alt="Nexo" height={24} src="/icons/nexo-mark.svg" width={24} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold leading-none text-[var(--primary)]">Nexo</p>
              <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                Hub personal
              </p>
            </div>
          </div>

          <nav aria-label="Navegación principal" className="space-y-1.5">
            {navigationItems.slice(0, 5).map((item, index) => {
              const Icon = item.icon;
              const active = index === 0;

              return (
                <a
                  className={
                    active
                      ? "nexo-inset flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold text-[var(--primary)]"
                      : "flex items-center gap-3 rounded-2xl px-3 py-2.5 font-medium text-[var(--muted)] transition hover:bg-[var(--surface-container-low)] hover:text-[var(--foreground)]"
                  }
                  href={item.href}
                  key={item.label}
                >
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={2.1} />
                  <span className="text-sm">{item.label}</span>
                </a>
              );
            })}
          </nav>

          <section className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                Espacios
              </p>
              <Button aria-label="Gestionar espacios" size="sm" variant="ghost">
                <Plus aria-hidden className="h-4 w-4" />
              </Button>
            </div>
            {spaces.map((space) => (
              <a
                className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-container-low)] hover:text-[var(--foreground)]"
                href="/spaces"
                key={space.name}
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: space.color }} />
                  {space.name}
                </span>
                <span className="nexo-inset rounded-lg px-2 py-0.5 text-[0.68rem] font-bold text-[var(--primary)]">
                  {space.count}
                </span>
              </a>
            ))}
          </section>
        </div>

        <div className="space-y-3 border-t border-[var(--surface-container)] pt-4">
          <a
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-container-low)]"
            href="/settings"
          >
            Ajustes
          </a>
          <div className="nexo-surface flex items-center justify-between rounded-3xl p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary-strong)]">
                AC
              </div>
              <div>
                <p className="text-sm font-bold">Usuario Nexo</p>
                <p className="text-xs text-[var(--muted-soft)]">@tu-usuario</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] px-8 py-3 shadow-[0_4px_12px_var(--shadow-dark-soft)] backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="font-display text-lg font-bold">Buenas tardes</h1>
              <p className="text-sm text-[var(--muted)]">Esto es lo que tienes para hoy</p>
            </div>
            <button className="nexo-inset hidden w-80 items-center justify-between rounded-2xl px-4 py-2 text-sm text-[var(--muted)] md:flex">
              <span className="flex items-center gap-2">
                <Search aria-hidden className="h-4 w-4" />
                Buscar notas, tareas...
              </span>
              <kbd className="nexo-surface-sm rounded-lg px-2 py-0.5 text-[0.68rem] font-bold text-[var(--primary)]">
                Ctrl K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary">
              <Plus aria-hidden className="h-4 w-4" />
              Crear
            </Button>
            <Button aria-label="Notificaciones" size="icon" variant="secondary">
              <Bell aria-hidden className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                Acceso rápido:
              </span>
              {["Apunte rápido", "Añadir tarea", "Temporizador 25m", "Subir archivo"].map((action) => (
                <Button key={action} size="sm">
                  {action}
                </Button>
              ))}
            </div>
            <Button size="sm" variant="secondary">
              Personalizar dashboard
            </Button>
          </div>

          <section className="grid grid-cols-12 gap-6">
            <Card className="col-span-12 p-6 lg:col-span-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="nexo-inset flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--primary)]">
                    <CalendarDays aria-hidden className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Hoy</CardTitle>
                    <CardDescription>Miércoles, 26 de febrero</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="mt-5 rounded-2xl border border-[color-mix(in_srgb,var(--border)_35%,transparent)] p-4">
                <p className="text-sm font-semibold">Sprint Review: Nexo Web</p>
                <p className="mt-1 text-sm text-[var(--muted)]">18:30 · Google Meet</p>
              </div>
            </Card>

            <Card className="col-span-12 p-6 lg:col-span-5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="nexo-inset flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--primary)]">
                    <Check aria-hidden className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Mis tareas</CardTitle>
                    <CardDescription>Base visual, datos mock centralizados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="mt-5 space-y-3">
                {dashboardTasks.map((task, index) => (
                  <div
                    className={index === 2 ? "nexo-inset rounded-2xl p-3 opacity-70" : "nexo-surface-sm rounded-2xl p-3"}
                    key={task.title}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={index === 2 ? "text-sm font-medium line-through text-[var(--muted-soft)]" : "text-sm font-semibold"}>
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {task.space} · {task.due}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--primary-strong)]">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="col-span-12 p-6 lg:col-span-3">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="nexo-inset flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--warning)]">
                    <Timer aria-hidden className="h-5 w-5" />
                  </div>
                  <CardTitle>Focus</CardTitle>
                </div>
              </CardHeader>
              <div className="nexo-inset mt-5 rounded-3xl p-4 text-center">
                <p className="font-display text-4xl font-bold text-[var(--primary)]">14.5h</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Tiempo productivo esta semana</p>
              </div>
              <Button className="mt-5 w-full" variant="primary">
                Iniciar Pomodoro
              </Button>
            </Card>

            <Card className="col-span-12 p-6 lg:col-span-7">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="nexo-inset flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--primary)]">
                    <FileText aria-hidden className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Notas recientes</CardTitle>
                    <CardDescription>Preparado para reemplazar mocks por queries</CardDescription>
                  </div>
                </div>
                <Button size="sm">
                  <Plus aria-hidden className="h-4 w-4" />
                  Nueva
                </Button>
              </CardHeader>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {recentNotes.map((note) => (
                  <article className="nexo-surface-sm rounded-2xl p-4" key={note.title}>
                    <span className="rounded-lg bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--primary-strong)]">
                      {note.space}
                    </span>
                    <h3 className="mt-3 text-sm font-bold">{note.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{note.excerpt}</p>
                    <p className="mt-4 border-t border-[color-mix(in_srgb,var(--border)_35%,transparent)] pt-3 text-xs text-[var(--muted-soft)]">
                      {note.editedAt}
                    </p>
                  </article>
                ))}
              </div>
            </Card>

            <Card className="col-span-12 p-6 lg:col-span-5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="nexo-inset flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--primary)]">
                    <FolderOpen aria-hidden className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Drive</CardTitle>
                    <CardDescription>1.4 GB de 5 GB utilizados</CardDescription>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--primary)]">28%</span>
              </CardHeader>
              <div className="nexo-inset mt-5 h-3 overflow-hidden rounded-full p-0.5">
                <div className="h-full w-[28%] rounded-full bg-[var(--primary)]" />
              </div>
              <div className="mt-5 space-y-3">
                {["Presentación final.pdf", "Sistema-Neumorfico.fig", "README_v2.md"].map((file) => (
                  <div className="nexo-inset flex items-center justify-between rounded-2xl p-3" key={file}>
                    <div>
                      <p className="text-sm font-semibold">{file}</p>
                      <p className="text-xs text-[var(--muted)]">Archivo reciente</p>
                    </div>
                    <Download aria-hidden className="h-4 w-4 text-[var(--muted)]" />
                  </div>
                ))}
              </div>
              <a className="mt-5 flex items-center justify-between text-sm font-semibold text-[var(--primary)]" href="/drive">
                Explorar carpetas
                <ChevronRight aria-hidden className="h-4 w-4" />
              </a>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
