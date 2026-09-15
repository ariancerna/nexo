"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Circle,
  FileText,
  FolderOpen,
  Home,
  ListChecks,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Timer,
  Trash2,
  Upload,
} from "lucide-react";

import { useAccent, type AccentColor, accentOptions } from "@/components/providers/accent-provider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNexoData } from "@/hooks/use-nexo-data";
import { createId, formatBytes } from "@/lib/nexo/default-data";
import type {
  CalendarEvent,
  DriveFile,
  ModuleKey,
  NexoData,
  NexoList,
  Note,
  Priority,
  SavedItem,
  SavedItemType,
  Space,
  Task,
  TaskStatus,
} from "@/types/nexo";

const modules: Array<{ key: ModuleKey; label: string; icon: typeof Home }> = [
  { key: "dashboard", label: "Inicio", icon: Home },
  { key: "notes", label: "Notas", icon: FileText },
  { key: "drive", label: "Drive", icon: FolderOpen },
  { key: "tasks", label: "Tareas", icon: CheckCircle2 },
  { key: "calendar", label: "Calendario", icon: CalendarDays },
  { key: "spaces", label: "Espacios", icon: Sparkles },
  { key: "saved", label: "Guardados", icon: Bookmark },
  { key: "lists", label: "Listas", icon: ListChecks },
  { key: "focus", label: "Focus", icon: Timer },
  { key: "settings", label: "Ajustes", icon: Settings },
];

const mobileModules: ModuleKey[] = ["dashboard", "notes", "spaces", "tasks", "settings"];
const taskStatuses: TaskStatus[] = ["todo", "in_progress", "completed"];
const priorities: Priority[] = ["low", "medium", "high"];
const savedTypes: SavedItemType[] = ["article", "video", "repository", "document", "link", "other"];

type FocusState =
  | { status: "idle"; durationSeconds: number; remainingSeconds: number; startedAt: null; taskId: null; spaceId: null }
  | {
      status: "running";
      durationSeconds: number;
      remainingSeconds: number;
      startedAt: number;
      taskId: string | null;
      spaceId: string | null;
    }
  | {
      status: "paused";
      durationSeconds: number;
      remainingSeconds: number;
      startedAt: null;
      taskId: string | null;
      spaceId: string | null;
    };

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function dateTimeInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(value));
}

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
}

function getSpace(spaces: Space[], id: string | null) {
  return spaces.find((space) => space.id === id) ?? null;
}

function countActiveModules(data: NexoData) {
  return data.settings.enabledModules.filter((module) => module !== "dashboard" && module !== "settings").length;
}

export function NexoWorkspace() {
  const { data, ready, setData, resetData } = useNexoData();
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [query, setQuery] = useState("");
  const [online, setOnline] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());
  const [focus, setFocus] = useState<FocusState>({
    status: "idle",
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    startedAt: null,
    taskId: null,
    spaceId: null,
  });
  const { setTheme } = useTheme();
  const { accent, setAccent } = useAccent();

  useEffect(() => {
    setOnline(navigator.onLine);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const remainingSeconds =
    focus.status === "running"
      ? Math.max(0, focus.durationSeconds - Math.floor((nowTick - focus.startedAt) / 1000))
      : focus.remainingSeconds;

  useEffect(() => {
    if (focus.status !== "running" || remainingSeconds > 0) {
      return;
    }

    const completedAt = new Date().toISOString();
    setData((current) => ({
      ...current,
      focusSessions: [
        {
          id: createId("focus"),
          durationMinutes: Math.round(focus.durationSeconds / 60),
          completedAt,
          taskId: focus.taskId,
          spaceId: focus.spaceId,
        },
        ...current.focusSessions,
      ],
    }));
    setFocus({
      status: "idle",
      durationSeconds: focus.durationSeconds,
      remainingSeconds: focus.durationSeconds,
      startedAt: null,
      taskId: null,
      spaceId: null,
    });
  }, [focus, remainingSeconds, setData]);

  const visibleModules = modules.filter(
    (module) => module.key === "dashboard" || module.key === "settings" || data.settings.enabledModules.includes(module.key),
  );
  const upcomingEvents = [...data.events].sort(
    (first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
  );
  const activeTasks = data.tasks.filter((task) => task.status !== "completed");
  const notes = data.notes.filter((note) => !note.isTrashed);
  const driveFiles = data.driveFiles.filter((file) => !file.isTrashed);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return [
      ...notes
        .filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(normalized))
        .map((note) => ({ id: note.id, type: "Nota", title: note.title, module: "notes" as ModuleKey })),
      ...data.tasks
        .filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(normalized))
        .map((task) => ({ id: task.id, type: "Tarea", title: task.title, module: "tasks" as ModuleKey })),
      ...driveFiles
        .filter((file) => file.name.toLowerCase().includes(normalized))
        .map((file) => ({ id: file.id, type: "Archivo", title: file.name, module: "drive" as ModuleKey })),
      ...data.spaces
        .filter((space) => `${space.name} ${space.description}`.toLowerCase().includes(normalized))
        .map((space) => ({ id: space.id, type: "Espacio", title: space.name, module: "spaces" as ModuleKey })),
      ...data.savedItems
        .filter((item) => `${item.title} ${item.description} ${item.url}`.toLowerCase().includes(normalized))
        .map((item) => ({ id: item.id, type: "Guardado", title: item.title, module: "saved" as ModuleKey })),
    ].slice(0, 8);
  }, [data.savedItems, data.spaces, data.tasks, driveFiles, notes, query]);

  const addNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = getFormValue(formData, "title");

    if (!title) {
      return;
    }

    const createdAt = new Date().toISOString();
    const note: Note = {
      id: createId("note"),
      title,
      content: getFormValue(formData, "content"),
      spaceId: getFormValue(formData, "spaceId") || null,
      isFavorite: false,
      isTrashed: false,
      createdAt,
      updatedAt: createdAt,
    };

    setData((current) => ({ ...current, notes: [note, ...current.notes] }));
    form.reset();
  };

  const updateNoteContent = (noteId: string, content: string) => {
    setData((current) => ({
      ...current,
      notes: current.notes.map((note) =>
        note.id === noteId ? { ...note, content, updatedAt: new Date().toISOString() } : note,
      ),
    }));
  };

  const addTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = getFormValue(formData, "title");

    if (!title) {
      return;
    }

    const createdAt = new Date().toISOString();
    const task: Task = {
      id: createId("task"),
      title,
      description: getFormValue(formData, "description"),
      priority: (getFormValue(formData, "priority") as Priority) || "medium",
      status: "todo",
      dueDate: getFormValue(formData, "dueDate"),
      spaceId: getFormValue(formData, "spaceId") || null,
      createdAt,
      updatedAt: createdAt,
    };

    setData((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    form.reset();
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task,
      ),
    }));
  };

  const addSpace = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = getFormValue(formData, "name");

    if (!name) {
      return;
    }

    const createdAt = new Date().toISOString();
    const space: Space = {
      id: createId("space"),
      name,
      description: getFormValue(formData, "description"),
      icon: getFormValue(formData, "icon") || "•",
      color: getFormValue(formData, "color") || "#4f46e5",
      createdAt,
      updatedAt: createdAt,
    };

    setData((current) => ({ ...current, spaces: [space, ...current.spaces] }));
    form.reset();
  };

  const addEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = getFormValue(formData, "title");

    if (!title) {
      return;
    }

    const createdAt = new Date().toISOString();
    const startsAt = new Date(getFormValue(formData, "startsAt")).toISOString();
    const endsAt = new Date(getFormValue(formData, "endsAt")).toISOString();
    const calendarEvent: CalendarEvent = {
      id: createId("event"),
      title,
      location: getFormValue(formData, "location"),
      startsAt,
      endsAt,
      spaceId: getFormValue(formData, "spaceId") || null,
      createdAt,
      updatedAt: createdAt,
    };

    setData((current) => ({ ...current, events: [...current.events, calendarEvent] }));
    form.reset();
  };

  const addSavedItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const url = getFormValue(formData, "url");

    if (!url) {
      return;
    }

    const savedItem: SavedItem = {
      id: createId("saved"),
      url,
      title: getFormValue(formData, "title") || url,
      description: getFormValue(formData, "description"),
      type: (getFormValue(formData, "type") as SavedItemType) || "link",
      spaceId: getFormValue(formData, "spaceId") || null,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    setData((current) => ({ ...current, savedItems: [savedItem, ...current.savedItems] }));
    form.reset();
  };

  const addList = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = getFormValue(formData, "name");

    if (!name) {
      return;
    }

    const createdAt = new Date().toISOString();
    const list: NexoList = {
      id: createId("list"),
      name,
      spaceId: getFormValue(formData, "spaceId") || null,
      createdAt,
      updatedAt: createdAt,
    };

    setData((current) => ({ ...current, lists: [list, ...current.lists] }));
    form.reset();
  };

  const addListItem = (event: React.FormEvent<HTMLFormElement>, listId: string) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = getFormValue(formData, "text");

    if (!text) {
      return;
    }

    setData((current) => ({
      ...current,
      listItems: [
        ...current.listItems,
        {
          id: createId("list-item"),
          listId,
          text,
          completed: false,
          position: current.listItems.filter((item) => item.listId === listId).length + 1,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    form.reset();
  };

  const addDriveFiles = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const createdAt = new Date().toISOString();
    const nextFiles: DriveFile[] = Array.from(files).map((file) => ({
      id: createId("file"),
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      spaceId: null,
      isFavorite: false,
      isTrashed: false,
      createdAt,
    }));

    setData((current) => ({ ...current, driveFiles: [...nextFiles, ...current.driveFiles] }));
  };

  const toggleModule = (moduleKey: ModuleKey) => {
    if (moduleKey === "dashboard" || moduleKey === "settings") {
      return;
    }

    setData((current) => {
      const enabled = current.settings.enabledModules.includes(moduleKey);
      const enabledModules = enabled
        ? current.settings.enabledModules.filter((module) => module !== moduleKey)
        : [...current.settings.enabledModules, moduleKey];

      return { ...current, settings: { ...current.settings, enabledModules } };
    });
  };

  const updateTheme = (theme: NexoData["settings"]["theme"]) => {
    setTheme(theme);
    setData((current) => ({ ...current, settings: { ...current.settings, theme } }));
  };

  const updateAccent = (nextAccent: AccentColor) => {
    setAccent(nextAccent);
    setData((current) => ({ ...current, settings: { ...current.settings, accentColor: nextAccent } }));
  };

  const startFocus = (minutes: number) => {
    setFocus({
      status: "running",
      durationSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      startedAt: Date.now(),
      taskId: null,
      spaceId: null,
    });
  };

  const pauseFocus = () => {
    setFocus((current) =>
      current.status === "running"
        ? { ...current, status: "paused", remainingSeconds, startedAt: null }
        : current,
    );
  };

  const resumeFocus = () => {
    setFocus((current) =>
      current.status === "paused"
        ? {
            ...current,
            status: "running",
            startedAt: Date.now() - (current.durationSeconds - current.remainingSeconds) * 1000,
          }
        : current,
    );
  };

  const resetFocus = () => {
    setFocus({
      status: "idle",
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      startedAt: null,
      taskId: null,
      spaceId: null,
    });
  };

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="nexo-surface rounded-3xl p-6 font-display text-xl font-bold text-[var(--primary)]">
          Cargando Nexo
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between bg-[var(--surface)] p-4 shadow-[6px_0_16px_var(--shadow-dark-soft)] lg:flex">
        <div className="space-y-6">
          <button
            className="flex items-center gap-3 px-2 pt-2 text-left"
            onClick={() => setActiveModule("dashboard")}
            type="button"
          >
            <div className="nexo-surface flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--primary)]">
              <span className="font-display text-lg font-black">N</span>
            </div>
            <div>
              <p className="font-display text-2xl font-bold leading-none text-[var(--primary)]">Nexo</p>
              <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                Hub personal
              </p>
            </div>
          </button>

          <nav aria-label="Navegación principal" className="space-y-1.5">
            {visibleModules.map((module) => {
              const Icon = module.icon;
              const active = activeModule === module.key;

              return (
                <button
                  className={
                    active
                      ? "nexo-inset flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold text-[var(--primary)]"
                      : "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-medium text-[var(--muted)] transition hover:bg-[var(--surface-container-low)] hover:text-[var(--foreground)]"
                  }
                  key={module.key}
                  onClick={() => setActiveModule(module.key)}
                  type="button"
                >
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={2.1} />
                  <span className="text-sm">{module.label}</span>
                </button>
              );
            })}
          </nav>

          <section className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                Espacios
              </p>
              <Button aria-label="Nuevo espacio" onClick={() => setActiveModule("spaces")} size="sm" variant="ghost">
                <Plus aria-hidden className="h-4 w-4" />
              </Button>
            </div>
            {data.spaces.slice(0, 5).map((space) => (
              <button
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-container-low)] hover:text-[var(--foreground)]"
                key={space.id}
                onClick={() => setActiveModule("spaces")}
                type="button"
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: space.color }} />
                  {space.name}
                </span>
                <span className="nexo-inset rounded-lg px-2 py-0.5 text-[0.68rem] font-bold text-[var(--primary)]">
                  {data.notes.filter((note) => note.spaceId === space.id).length + data.tasks.filter((task) => task.spaceId === space.id).length}
                </span>
              </button>
            ))}
          </section>
        </div>

        <ProfileFooter online={online} />
      </aside>

      <header className="safe-top sticky top-0 z-30 flex items-center justify-between bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-4 py-3 shadow-[0_4px_12px_var(--shadow-dark-soft)] backdrop-blur-md lg:ml-64 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold lg:text-2xl">
            {modules.find((module) => module.key === activeModule)?.label ?? "Nexo"}
          </h1>
          <p className="hidden text-sm text-[var(--muted)] sm:block">
            {online ? "Sincronizado localmente" : "Modo sin conexión"}
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <label className="nexo-inset hidden w-80 items-center gap-2 rounded-2xl px-4 py-2 text-sm text-[var(--muted)] md:flex">
            <Search aria-hidden className="h-4 w-4" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-[var(--muted-soft)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en Nexo..."
              value={query}
            />
          </label>
          <Button aria-label="Buscar" className="md:hidden" onClick={() => setQuery(query ? "" : " ")} size="icon">
            <Search aria-hidden className="h-5 w-5" />
          </Button>
          <Button onClick={() => setActiveModule("notes")} variant="primary">
            <Plus aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">Crear</span>
          </Button>
          <Button aria-label="Notificaciones" size="icon" variant="secondary">
            <Bell aria-hidden className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="pb-28 lg:ml-64 lg:pb-8">
        <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
          {query.trim() ? (
            <SearchPanel
              onClear={() => setQuery("")}
              onOpenModule={(module) => {
                setActiveModule(module);
                setQuery("");
              }}
              results={searchResults}
            />
          ) : null}

          {activeModule === "dashboard" ? (
            <DashboardView
              activeTasks={activeTasks}
              driveFiles={driveFiles}
              events={upcomingEvents}
              focusSessions={data.focusSessions}
              notes={notes}
              onNavigate={setActiveModule}
              spaces={data.spaces}
            />
          ) : null}
          {activeModule === "notes" ? (
            <NotesView
              addNote={addNote}
              notes={notes}
              onDeleteNote={(noteId) =>
                setData((current) => ({
                  ...current,
                  notes: current.notes.map((note) => (note.id === noteId ? { ...note, isTrashed: true } : note)),
                }))
              }
              onToggleFavorite={(noteId) =>
                setData((current) => ({
                  ...current,
                  notes: current.notes.map((note) =>
                    note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note,
                  ),
                }))
              }
              onUpdateContent={updateNoteContent}
              spaces={data.spaces}
            />
          ) : null}
          {activeModule === "tasks" ? (
            <TasksView addTask={addTask} onUpdateStatus={updateTaskStatus} spaces={data.spaces} tasks={data.tasks} />
          ) : null}
          {activeModule === "drive" ? (
            <DriveView driveFiles={driveFiles} onUpload={addDriveFiles} />
          ) : null}
          {activeModule === "calendar" ? <CalendarView addEvent={addEvent} events={data.events} spaces={data.spaces} /> : null}
          {activeModule === "spaces" ? (
            <SpacesView addSpace={addSpace} notes={notes} spaces={data.spaces} tasks={data.tasks} />
          ) : null}
          {activeModule === "saved" ? (
            <SavedView addSavedItem={addSavedItem} items={data.savedItems} spaces={data.spaces} />
          ) : null}
          {activeModule === "lists" ? (
            <ListsView
              addList={addList}
              addListItem={addListItem}
              items={data.listItems}
              lists={data.lists}
              setData={setData}
              spaces={data.spaces}
            />
          ) : null}
          {activeModule === "focus" ? (
            <FocusView
              focus={focus}
              remainingSeconds={remainingSeconds}
              resetFocus={resetFocus}
              resumeFocus={resumeFocus}
              sessions={data.focusSessions}
              startFocus={startFocus}
              pauseFocus={pauseFocus}
            />
          ) : null}
          {activeModule === "settings" ? (
            <SettingsView
              accent={accent}
              activeModules={countActiveModules(data)}
              modules={modules}
              onReset={resetData}
              settings={data.settings}
              toggleModule={toggleModule}
              updateAccent={updateAccent}
              updateTheme={updateTheme}
            />
          ) : null}
        </div>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[520px] items-center justify-around rounded-t-3xl bg-[var(--surface)] px-2 pt-2 shadow-[0_-4px_20px_var(--shadow-dark-soft)] lg:hidden">
        {mobileModules.map((moduleKey) => {
          const moduleItem = modules.find((item) => item.key === moduleKey);
          if (!moduleItem) {
            return null;
          }

          const Icon = moduleItem.icon;
          const active = activeModule === moduleItem.key;

          return (
            <button
              className={
                active
                  ? "flex flex-col items-center justify-center rounded-2xl bg-[var(--primary)] px-3 py-1 text-[var(--primary-foreground)]"
                  : "flex flex-col items-center justify-center px-3 py-1 text-[var(--muted)]"
              }
              key={moduleItem.key}
              onClick={() => setActiveModule(moduleItem.key)}
              type="button"
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span className="mt-0.5 text-[0.68rem] font-bold">{moduleItem.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ProfileFooter({ online }: { online: boolean }) {
  return (
    <div className="space-y-3 border-t border-[var(--surface-container)] pt-4">
      <div className="nexo-surface flex items-center justify-between rounded-3xl p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary-strong)]">
            AC
          </div>
          <div>
            <p className="text-sm font-bold">Arian Cerna</p>
            <p className="text-xs text-[var(--muted-soft)]">{online ? "En línea" : "Sin conexión"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPanel({
  results,
  onOpenModule,
  onClear,
}: {
  results: Array<{ id: string; type: string; title: string; module: ModuleKey }>;
  onOpenModule: (module: ModuleKey) => void;
  onClear: () => void;
}) {
  return (
    <Card className="nexo-floating p-4">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Búsqueda global</CardTitle>
          <CardDescription>Resultados guardados localmente en tu espacio.</CardDescription>
        </div>
        <Button onClick={onClear} size="sm">
          Cerrar
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {results.length ? (
          results.map((result) => (
            <button
              className="nexo-surface-sm flex w-full items-center justify-between rounded-2xl p-3 text-left"
              key={`${result.type}-${result.id}`}
              onClick={() => onOpenModule(result.module)}
              type="button"
            >
              <span>
                <span className="block text-sm font-bold">{result.title}</span>
                <span className="text-xs text-[var(--muted)]">{result.type}</span>
              </span>
              <Search aria-hidden className="h-4 w-4 text-[var(--primary)]" />
            </button>
          ))
        ) : (
          <p className="rounded-2xl bg-[var(--surface-container-low)] p-4 text-sm text-[var(--muted)]">
            No encontré resultados con ese texto.
          </p>
        )}
      </div>
    </Card>
  );
}

function DashboardView({
  activeTasks,
  notes,
  driveFiles,
  events,
  spaces,
  focusSessions,
  onNavigate,
}: {
  activeTasks: Task[];
  notes: Note[];
  driveFiles: DriveFile[];
  events: CalendarEvent[];
  spaces: Space[];
  focusSessions: NexoData["focusSessions"];
  onNavigate: (module: ModuleKey) => void;
}) {
  const completedFocusMinutes = focusSessions.reduce((total, session) => total + session.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CheckCircle2} label="Tareas activas" value={activeTasks.length.toString()} />
        <MetricCard icon={FileText} label="Notas" value={notes.length.toString()} />
        <MetricCard icon={FolderOpen} label="Archivos" value={driveFiles.length.toString()} />
        <MetricCard icon={Timer} label="Focus completado" value={`${completedFocusMinutes}m`} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 p-5 lg:col-span-4">
          <CardHeader>
            <div>
              <CardTitle>Hoy</CardTitle>
              <CardDescription>{new Intl.DateTimeFormat("es", { dateStyle: "full" }).format(new Date())}</CardDescription>
            </div>
            <CalendarDays aria-hidden className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>
          <div className="mt-4 space-y-3">
            {events.slice(0, 3).map((event) => (
              <div className="nexo-inset rounded-2xl p-3" key={event.id}>
                <p className="text-sm font-bold">{event.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{formatDate(event.startsAt)}</p>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={() => onNavigate("calendar")}>
            Ver calendario
          </Button>
        </Card>

        <Card className="col-span-12 p-5 lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Mis tareas</CardTitle>
              <CardDescription>Pendientes ordenados por prioridad.</CardDescription>
            </div>
            <Button onClick={() => onNavigate("tasks")} size="sm">
              Gestionar
            </Button>
          </CardHeader>
          <div className="mt-4 space-y-3">
            {activeTasks.slice(0, 4).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-5 lg:col-span-3">
          <CardHeader>
            <div>
              <CardTitle>Espacios</CardTitle>
              <CardDescription>{spaces.length} áreas activas</CardDescription>
            </div>
            <Sparkles aria-hidden className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>
          <div className="mt-4 space-y-3">
            {spaces.slice(0, 4).map((space) => (
              <div className="flex items-center gap-3" key={space.id}>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: space.color }} />
                <span className="text-sm font-semibold">{space.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-5 lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Notas recientes</CardTitle>
              <CardDescription>Contenido guardado en este dispositivo.</CardDescription>
            </div>
            <Button onClick={() => onNavigate("notes")} size="sm">
              Nueva nota
            </Button>
          </CardHeader>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {notes.slice(0, 4).map((note) => (
              <article className="nexo-surface-sm rounded-2xl p-4" key={note.id}>
                <h3 className="text-sm font-bold">{note.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{note.content}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 p-5 lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Drive</CardTitle>
              <CardDescription>Metadata local lista para Supabase Storage.</CardDescription>
            </div>
            <Button onClick={() => onNavigate("drive")} size="sm">
              Subir
            </Button>
          </CardHeader>
          <div className="mt-4 space-y-3">
            {driveFiles.slice(0, 4).map((file) => (
              <div className="nexo-inset flex items-center justify-between rounded-2xl p-3" key={file.id}>
                <span className="truncate text-sm font-semibold">{file.name}</span>
                <span className="text-xs text-[var(--muted)]">{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-soft)]">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-[var(--primary)]">{value}</p>
        </div>
        <div className="nexo-inset flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--primary)]">
          <Icon aria-hidden className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function SpaceSelect({ spaces, name = "spaceId" }: { spaces: Space[]; name?: string }) {
  return (
    <select className="nexo-inset h-11 rounded-2xl px-3 text-sm outline-none" defaultValue="" name={name}>
      <option value="">Sin espacio</option>
      {spaces.map((space) => (
        <option key={space.id} value={space.id}>
          {space.name}
        </option>
      ))}
    </select>
  );
}

function NotesView({
  notes,
  spaces,
  addNote,
  onUpdateContent,
  onToggleFavorite,
  onDeleteNote,
}: {
  notes: Note[];
  spaces: Space[];
  addNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateContent: (noteId: string, content: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-5">
        <CardTitle>Nueva nota</CardTitle>
        <form className="mt-4 space-y-3" onSubmit={addNote}>
          <Input name="title" placeholder="Título" required />
          <SpaceSelect spaces={spaces} />
          <textarea
            className="nexo-inset min-h-40 w-full rounded-2xl p-4 text-sm outline-none"
            name="content"
            placeholder="Escribe una nota rápida..."
          />
          <Button className="w-full" type="submit" variant="primary">
            Guardar nota
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => {
          const space = getSpace(spaces, note.spaceId);

          return (
            <Card className="p-5" key={note.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[var(--primary)]">{space?.name ?? "Sin espacio"}</p>
                  <h2 className="mt-2 font-display text-lg font-bold">{note.title}</h2>
                </div>
                <div className="flex gap-2">
                  <Button aria-label="Favorito" onClick={() => onToggleFavorite(note.id)} size="icon" variant="ghost">
                    <Star className="h-4 w-4" fill={note.isFavorite ? "currentColor" : "none"} />
                  </Button>
                  <Button aria-label="Eliminar" onClick={() => onDeleteNote(note.id)} size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <textarea
                className="mt-4 min-h-44 w-full resize-none rounded-2xl bg-transparent text-sm leading-6 text-[var(--muted)] outline-none"
                onBlur={(event) => onUpdateContent(note.id, event.target.value)}
                defaultValue={note.content}
              />
              <p className="mt-3 text-xs text-[var(--muted-soft)]">Guardado local: {formatDate(note.updatedAt)}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TasksView({
  tasks,
  spaces,
  addTask,
  onUpdateStatus,
}: {
  tasks: Task[];
  spaces: Space[];
  addTask: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardTitle>Nueva tarea</CardTitle>
        <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_160px_160px_auto]" onSubmit={addTask}>
          <Input name="title" placeholder="Título" required />
          <Input name="description" placeholder="Descripción" />
          <select className="nexo-inset h-11 rounded-2xl px-3 text-sm outline-none" defaultValue="medium" name="priority">
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "high" ? "Alta" : priority === "medium" ? "Media" : "Baja"}
              </option>
            ))}
          </select>
          <Input name="dueDate" type="date" defaultValue={todayInputValue()} />
          <Button type="submit" variant="primary">
            Crear
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        {taskStatuses.map((status) => (
          <Card className="p-5" key={status}>
            <CardTitle>
              {status === "todo" ? "Por hacer" : status === "in_progress" ? "En progreso" : "Completadas"}
            </CardTitle>
            <div className="mt-4 space-y-3">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => {
                  const space = getSpace(spaces, task.spaceId);

                  return (
                    <div className="nexo-surface-sm rounded-2xl p-4" key={task.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{task.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{task.description || "Sin descripción"}</p>
                        </div>
                        <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--primary-strong)]">
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-[var(--muted)]">
                        {space?.name ?? "Sin espacio"} · {task.dueDate || "Sin fecha"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        {taskStatuses.map((nextStatus) => (
                          <Button
                            key={nextStatus}
                            onClick={() => onUpdateStatus(task.id, nextStatus)}
                            size="sm"
                            variant={nextStatus === task.status ? "inset" : "secondary"}
                          >
                            {nextStatus === "todo" ? "Todo" : nextStatus === "in_progress" ? "Progreso" : "Lista"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="nexo-surface-sm rounded-2xl p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{task.title}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{task.dueDate || "Sin fecha"}</p>
        </div>
        <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--primary-strong)]">
          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
        </span>
      </div>
    </div>
  );
}

function DriveView({ driveFiles, onUpload }: { driveFiles: DriveFile[]; onUpload: (files: FileList | null) => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Drive</CardTitle>
            <CardDescription>Sube archivos para registrar metadata local. Supabase Storage se conectará después.</CardDescription>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] nexo-primary-shadow">
            <Upload className="h-4 w-4" />
            Subir archivo
            <input className="sr-only" multiple onChange={(event) => onUpload(event.target.files)} type="file" />
          </label>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {driveFiles.map((file) => (
          <Card className="p-5" key={file.id}>
            <FolderOpen className="h-7 w-7 text-[var(--primary)]" />
            <h2 className="mt-4 truncate font-display text-lg font-bold">{file.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{formatBytes(file.size)}</p>
            <p className="text-xs text-[var(--muted-soft)]">{file.type}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CalendarView({
  events,
  spaces,
  addEvent,
}: {
  events: CalendarEvent[];
  spaces: Space[];
  addEvent: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-5">
        <CardTitle>Nuevo evento</CardTitle>
        <form className="mt-4 space-y-3" onSubmit={addEvent}>
          <Input name="title" placeholder="Título" required />
          <Input name="location" placeholder="Lugar o enlace" />
          <Input name="startsAt" type="datetime-local" defaultValue={dateTimeInputValue(new Date())} required />
          <Input
            name="endsAt"
            type="datetime-local"
            defaultValue={dateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000))}
            required
          />
          <SpaceSelect spaces={spaces} />
          <Button className="w-full" type="submit" variant="primary">
            Guardar evento
          </Button>
        </form>
      </Card>
      <div className="space-y-4">
        {[...events]
          .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime())
          .map((event) => {
            const space = getSpace(spaces, event.spaceId);

            return (
              <Card className="p-5" key={event.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold">{event.title}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">{event.location || "Sin ubicación"}</p>
                  </div>
                  <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary-strong)]">
                    {space?.name ?? "General"}
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {formatDate(event.startsAt)} - {formatDate(event.endsAt)}
                </p>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

function SpacesView({
  spaces,
  notes,
  tasks,
  addSpace,
}: {
  spaces: Space[];
  notes: Note[];
  tasks: Task[];
  addSpace: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-5">
        <CardTitle>Nuevo espacio</CardTitle>
        <form className="mt-4 space-y-3" onSubmit={addSpace}>
          <Input name="name" placeholder="Nombre" required />
          <Input name="description" placeholder="Descripción" />
          <Input name="icon" placeholder="Icono breve" />
          <Input name="color" type="color" defaultValue="#4f46e5" />
          <Button className="w-full" type="submit" variant="primary">
            Crear espacio
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {spaces.map((space) => (
          <Card className="p-5" key={space.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-2xl">{space.icon}</span>
                <h2 className="mt-3 font-display text-lg font-bold">{space.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{space.description}</p>
              </div>
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: space.color }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="nexo-inset rounded-2xl p-3">
                <p className="text-xs text-[var(--muted)]">Notas</p>
                <p className="font-display text-2xl font-bold">{notes.filter((note) => note.spaceId === space.id).length}</p>
              </div>
              <div className="nexo-inset rounded-2xl p-3">
                <p className="text-xs text-[var(--muted)]">Tareas</p>
                <p className="font-display text-2xl font-bold">{tasks.filter((task) => task.spaceId === space.id).length}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SavedView({
  items,
  spaces,
  addSavedItem,
}: {
  items: SavedItem[];
  spaces: Space[];
  addSavedItem: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-5">
        <CardTitle>Guardar enlace</CardTitle>
        <form className="mt-4 space-y-3" onSubmit={addSavedItem}>
          <Input name="url" placeholder="https://..." type="url" required />
          <Input name="title" placeholder="Título" />
          <Input name="description" placeholder="Descripción" />
          <select className="nexo-inset h-11 w-full rounded-2xl px-3 text-sm outline-none" defaultValue="link" name="type">
            {savedTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <SpaceSelect spaces={spaces} />
          <Button className="w-full" type="submit" variant="primary">
            Guardar
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const space = getSpace(spaces, item.spaceId);

          return (
            <Card className="p-5" key={item.id}>
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary-strong)]">
                  {item.type}
                </span>
                <Star className="h-4 w-4 text-[var(--primary)]" fill={item.isFavorite ? "currentColor" : "none"} />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.description || item.url}</p>
              <a className="mt-4 block truncate text-sm font-semibold text-[var(--primary)]" href={item.url} rel="noreferrer" target="_blank">
                {item.url}
              </a>
              <p className="mt-2 text-xs text-[var(--muted-soft)]">{space?.name ?? "Sin espacio"}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ListsView({
  lists,
  items,
  spaces,
  setData,
  addList,
  addListItem,
}: {
  lists: NexoData["lists"];
  items: NexoData["listItems"];
  spaces: Space[];
  setData: React.Dispatch<React.SetStateAction<NexoData>>;
  addList: (event: React.FormEvent<HTMLFormElement>) => void;
  addListItem: (event: React.FormEvent<HTMLFormElement>, listId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardTitle>Nueva lista</CardTitle>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]" onSubmit={addList}>
          <Input name="name" placeholder="Nombre de la lista" required />
          <SpaceSelect spaces={spaces} />
          <Button type="submit" variant="primary">
            Crear
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        {lists.map((list) => (
          <Card className="p-5" key={list.id}>
            <CardTitle>{list.name}</CardTitle>
            <div className="mt-4 space-y-2">
              {items
                .filter((item) => item.listId === list.id)
                .sort((first, second) => first.position - second.position)
                .map((item) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-[var(--surface-container-low)]"
                    key={item.id}
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        listItems: current.listItems.map((listItem) =>
                          listItem.id === item.id ? { ...listItem, completed: !listItem.completed } : listItem,
                        ),
                      }))
                    }
                    type="button"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[var(--muted)]" />
                    )}
                    <span className={item.completed ? "text-sm line-through text-[var(--muted-soft)]" : "text-sm font-medium"}>
                      {item.text}
                    </span>
                  </button>
                ))}
            </div>
            <form className="mt-4 flex gap-2" onSubmit={(event) => addListItem(event, list.id)}>
              <Input name="text" placeholder="Añadir item" required />
              <Button aria-label="Añadir" size="icon" type="submit" variant="primary">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FocusView({
  focus,
  remainingSeconds,
  sessions,
  startFocus,
  pauseFocus,
  resumeFocus,
  resetFocus,
}: {
  focus: FocusState;
  remainingSeconds: number;
  sessions: NexoData["focusSessions"];
  startFocus: (minutes: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  resetFocus: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="grid place-items-center p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
          {focus.status === "running" ? "En progreso" : focus.status === "paused" ? "Pausado" : "Listo"}
        </p>
        <p className="mt-6 font-display text-7xl font-bold text-[var(--primary)] sm:text-8xl">{formatTimer(remainingSeconds)}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {focus.status === "idle" ? (
            <>
              <Button onClick={() => startFocus(25)} variant="primary">
                <Play className="h-4 w-4" />
                25 minutos
              </Button>
              <Button onClick={() => startFocus(50)}>50 minutos</Button>
            </>
          ) : null}
          {focus.status === "running" ? (
            <Button onClick={pauseFocus} variant="primary">
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
          ) : null}
          {focus.status === "paused" ? (
            <Button onClick={resumeFocus} variant="primary">
              <Play className="h-4 w-4" />
              Continuar
            </Button>
          ) : null}
          <Button onClick={resetFocus}>
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </Card>
      <Card className="p-5">
        <CardTitle>Sesiones terminadas</CardTitle>
        <div className="mt-4 space-y-3">
          {sessions.length ? (
            sessions.slice(0, 8).map((session) => (
              <div className="nexo-inset rounded-2xl p-3" key={session.id}>
                <p className="text-sm font-bold">{session.durationMinutes} minutos</p>
                <p className="text-xs text-[var(--muted)]">{formatDate(session.completedAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">Completa tu primera sesión para ver historial.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function SettingsView({
  settings,
  modules: availableModules,
  accent,
  activeModules,
  updateTheme,
  updateAccent,
  toggleModule,
  onReset,
}: {
  settings: NexoData["settings"];
  modules: typeof modules;
  accent: AccentColor;
  activeModules: number;
  updateTheme: (theme: NexoData["settings"]["theme"]) => void;
  updateAccent: (accent: AccentColor) => void;
  toggleModule: (module: ModuleKey) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <CardHeader>
            <div>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Preferencias visuales guardadas localmente.</CardDescription>
            </div>
          </CardHeader>
          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-sm font-bold">Tema</p>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <Button
                    key={theme}
                    onClick={() => updateTheme(theme)}
                    variant={settings.theme === theme ? "inset" : "secondary"}
                  >
                    {theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : null}
                    {theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema"}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Color de acento</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {accentOptions.map((option) => (
                  <button
                    className={
                      accent === option
                        ? "nexo-inset rounded-2xl p-2 text-xs font-bold text-[var(--primary)]"
                        : "nexo-surface-sm rounded-2xl p-2 text-xs font-semibold text-[var(--muted)]"
                    }
                    key={option}
                    onClick={() => updateAccent(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader>
            <div>
              <CardTitle>Módulos</CardTitle>
              <CardDescription>{activeModules} módulos activos. Desactivar no borra datos.</CardDescription>
            </div>
          </CardHeader>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {availableModules
              .filter((module) => module.key !== "dashboard" && module.key !== "settings")
              .map((module) => {
                const Icon = module.icon;
                const enabled = settings.enabledModules.includes(module.key);

                return (
                  <div className="nexo-surface-sm flex items-center justify-between rounded-2xl p-3" key={module.key}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[var(--primary)]" />
                      <span className="text-sm font-bold">{module.label}</span>
                    </div>
                    <Switch checked={enabled} onClick={() => toggleModule(module.key)} />
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Datos locales</CardTitle>
            <CardDescription>Esto restablece los datos de ejemplo guardados en este navegador.</CardDescription>
          </div>
          <Button onClick={onReset}>Restablecer datos</Button>
        </CardHeader>
      </Card>
    </div>
  );
}
