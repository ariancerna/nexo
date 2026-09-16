"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Code2,
  Dumbbell,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  Heart,
  Home,
  ListChecks,
  Lightbulb,
  LogOut,
  Moon,
  Pause,
  Palette,
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

import { signOut } from "@/app/auth/actions";
import type { WorkspaceUser } from "@/components/layout/app-shell";
import { accentPalette, useAccent, type AccentColor } from "@/components/providers/accent-provider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FeedbackDialog, type FeedbackDialogState } from "@/components/ui/feedback-dialog";
import { Switch } from "@/components/ui/switch";
import { useNexoData, type NexoSyncStatus } from "@/hooks/use-nexo-data";
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
const spaceIconOptions = [
  { value: "sparkles", label: "General", icon: Sparkles, aliases: [] },
  { value: "study", label: "Estudio", icon: GraduationCap, aliases: ["🎓"] },
  { value: "code", label: "Programación", icon: Code2, aliases: ["💻"] },
  { value: "home", label: "Hogar", icon: Home, aliases: ["🏠"] },
  { value: "work", label: "Trabajo", icon: BriefcaseBusiness, aliases: ["💼"] },
  { value: "health", label: "Salud", icon: Heart, aliases: ["❤️", "❤"] },
  { value: "fitness", label: "Ejercicio", icon: Dumbbell, aliases: ["🏋️"] },
  { value: "creative", label: "Creatividad", icon: Palette, aliases: ["🎨"] },
  { value: "ideas", label: "Ideas", icon: Lightbulb, aliases: ["💡"] },
] as const;

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

function SpaceIcon({ value, className = "h-5 w-5" }: { value: string; className?: string }) {
  const option = spaceIconOptions.find((item) => item.value === value || item.aliases.some((alias) => alias === value));
  const Icon = option?.icon ?? Sparkles;
  return <Icon aria-hidden className={className} />;
}

export function NexoWorkspace({ user }: { user: WorkspaceUser }) {
  const {
    data,
    ready,
    syncStatus,
    syncMessage,
    setData,
    resetData,
    uploadDriveFiles,
    openDriveFile,
    deleteDriveFile,
  } = useNexoData();
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dialog, setDialog] = useState<FeedbackDialogState | null>(null);
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
  const closeDialog = useCallback(() => setDialog(null), []);

  const requestRemoval = (label: string, onConfirm: () => void | Promise<void>) => {
    setDialog({
      title: "Confirmar eliminación",
      description: `Vas a eliminar ${label}. Esta acción no se puede deshacer.`,
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm,
    });
  };

  useEffect(() => {
    if (!ready) return;
    setTheme(data.settings.theme);
    setAccent(data.settings.accentColor);
  }, [data.settings.accentColor, data.settings.theme, ready, setAccent, setTheme]);

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

  const deleteTask = (task: Task) => {
    requestRemoval(`la tarea “${task.title}”`, () => {
      setData((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }));
    });
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
      icon: getFormValue(formData, "icon") || "sparkles",
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

    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setDialog({
        title: "Revisa el horario",
        description: "La hora de finalización debe ser posterior al inicio.",
        variant: "info",
      });
      return;
    }
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

  const deleteEvent = (calendarEvent: CalendarEvent) => {
    requestRemoval(`el evento “${calendarEvent.title}”`, () => {
      setData((current) => ({ ...current, events: current.events.filter((item) => item.id !== calendarEvent.id) }));
    });
  };

  const deleteSpace = (space: Space) => {
    requestRemoval(`el espacio “${space.name}”`, () => {
      setData((current) => ({
        ...current,
        spaces: current.spaces.filter((item) => item.id !== space.id),
        notes: current.notes.map((item) => (item.spaceId === space.id ? { ...item, spaceId: null } : item)),
        tasks: current.tasks.map((item) => (item.spaceId === space.id ? { ...item, spaceId: null } : item)),
        events: current.events.map((item) => (item.spaceId === space.id ? { ...item, spaceId: null } : item)),
        savedItems: current.savedItems.map((item) => (item.spaceId === space.id ? { ...item, spaceId: null } : item)),
        lists: current.lists.map((item) => (item.spaceId === space.id ? { ...item, spaceId: null } : item)),
        driveFiles: current.driveFiles.map((item) => (item.spaceId === space.id ? { ...item, spaceId: null } : item)),
        focusSessions: current.focusSessions.map((item) =>
          item.spaceId === space.id ? { ...item, spaceId: null } : item,
        ),
      }));
    });
  };

  const addSavedItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const url = getFormValue(formData, "url");

    if (!url) {
      return;
    }

    let normalizedUrl: string;

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new Error("unsupported protocol");
      normalizedUrl = parsedUrl.toString();
    } catch {
      setDialog({
        title: "Enlace no válido",
        description: "Usa una dirección completa que comience con http:// o https://.",
        variant: "info",
      });
      return;
    }

    const savedItem: SavedItem = {
      id: createId("saved"),
      url: normalizedUrl,
      title: getFormValue(formData, "title") || normalizedUrl,
      description: getFormValue(formData, "description"),
      type: (getFormValue(formData, "type") as SavedItemType) || "link",
      spaceId: getFormValue(formData, "spaceId") || null,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    setData((current) => ({ ...current, savedItems: [savedItem, ...current.savedItems] }));
    form.reset();
  };

  const toggleSavedFavorite = (itemId: string) => {
    setData((current) => ({
      ...current,
      savedItems: current.savedItems.map((item) =>
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    }));
  };

  const deleteSavedItem = (item: SavedItem) => {
    requestRemoval(`el enlace “${item.title}”`, () => {
      setData((current) => ({
        ...current,
        savedItems: current.savedItems.filter((currentItem) => currentItem.id !== item.id),
      }));
    });
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

  const deleteList = (list: NexoList) => {
    requestRemoval(`la lista “${list.name}” y sus elementos`, () => {
      setData((current) => ({
        ...current,
        lists: current.lists.filter((item) => item.id !== list.id),
        listItems: current.listItems.filter((item) => item.listId !== list.id),
      }));
    });
  };

  const addDriveFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const nextFiles = await uploadDriveFiles(files);

    setData((current) => ({ ...current, driveFiles: [...nextFiles, ...current.driveFiles] }));
  };

  const removeDriveFile = async (file: DriveFile) => {
    requestRemoval(`el archivo “${file.name}”`, () => deleteDriveFile(file));
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
            <div className="nexo-surface flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
              <Image alt="Nexo" height={24} src="/icons/nexo-mark.svg" width={24} />
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
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${space.color}20`, color: space.color }}
                  >
                    <SpaceIcon className="h-4 w-4" value={space.icon} />
                  </span>
                  {space.name}
                </span>
                <span className="nexo-inset rounded-lg px-2 py-0.5 text-[0.68rem] font-bold text-[var(--primary)]">
                  {data.notes.filter((note) => note.spaceId === space.id).length + data.tasks.filter((task) => task.spaceId === space.id).length}
                </span>
              </button>
            ))}
          </section>
        </div>

        <ProfileFooter online={online} syncMessage={syncMessage} syncStatus={syncStatus} user={user} />
      </aside>

      <header className="safe-top sticky top-0 z-30 bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-4 py-3 shadow-[0_4px_12px_var(--shadow-dark-soft)] backdrop-blur-md lg:ml-64 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold lg:text-2xl">
              {modules.find((module) => module.key === activeModule)?.label ?? "Nexo"}
            </h1>
            <p className="hidden text-sm text-[var(--muted)] sm:block">{online ? syncMessage : "Modo sin conexión"}</p>
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
            <Button
              aria-expanded={mobileSearchOpen}
              aria-label={mobileSearchOpen ? "Cerrar búsqueda" : "Buscar"}
              className="md:hidden"
              onClick={() => {
                setMobileSearchOpen((current) => !current);
                if (mobileSearchOpen) setQuery("");
              }}
              size="icon"
            >
              <Search aria-hidden className="h-5 w-5" />
            </Button>
            <Button onClick={() => setActiveModule("notes")} variant="primary">
              <Plus aria-hidden className="h-4 w-4" />
              <span className="hidden sm:inline">Crear</span>
            </Button>
          </div>
        </div>

        <select
          aria-label="Cambiar módulo"
          className="nexo-inset mt-3 h-10 w-full rounded-xl px-3 text-sm font-semibold outline-none lg:hidden"
          onChange={(event) => setActiveModule(event.target.value as ModuleKey)}
          value={activeModule}
        >
          {visibleModules.map((module) => (
            <option key={module.key} value={module.key}>
              {module.label}
            </option>
          ))}
        </select>

        {mobileSearchOpen ? (
          <label className="nexo-inset mt-3 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-[var(--muted)] md:hidden">
            <Search aria-hidden className="h-4 w-4" />
            <input
              autoFocus
              className="w-full bg-transparent outline-none placeholder:text-[var(--muted-soft)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en Nexo..."
              value={query}
            />
          </label>
        ) : null}
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
              onDeleteNote={(note) => {
                requestRemoval(`la nota “${note.title}”`, () => {
                  setData((current) => ({
                    ...current,
                    notes: current.notes.filter((currentNote) => currentNote.id !== note.id),
                  }));
                });
              }}
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
            <TasksView
              addTask={addTask}
              onDelete={deleteTask}
              onUpdateStatus={updateTaskStatus}
              spaces={data.spaces}
              tasks={data.tasks}
            />
          ) : null}
          {activeModule === "drive" ? (
            <DriveView driveFiles={driveFiles} onDelete={removeDriveFile} onOpen={openDriveFile} onUpload={addDriveFiles} />
          ) : null}
          {activeModule === "calendar" ? (
            <CalendarView addEvent={addEvent} events={data.events} onDelete={deleteEvent} spaces={data.spaces} />
          ) : null}
          {activeModule === "spaces" ? (
            <SpacesView addSpace={addSpace} notes={notes} onDelete={deleteSpace} spaces={data.spaces} tasks={data.tasks} />
          ) : null}
          {activeModule === "saved" ? (
            <SavedView
              addSavedItem={addSavedItem}
              items={data.savedItems}
              onDelete={deleteSavedItem}
              onToggleFavorite={toggleSavedFavorite}
              spaces={data.spaces}
            />
          ) : null}
          {activeModule === "lists" ? (
            <ListsView
              addList={addList}
              addListItem={addListItem}
              items={data.listItems}
              lists={data.lists}
              onDeleteList={deleteList}
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
              onReset={() => {
                setDialog({
                  title: "Restablecer workspace",
                  description: "Tus datos actuales serán reemplazados por los ejemplos iniciales de Nexo.",
                  variant: "danger",
                  confirmLabel: "Restablecer",
                  onConfirm: resetData,
                });
              }}
              settings={data.settings}
              toggleModule={toggleModule}
              updateAccent={updateAccent}
              updateTheme={updateTheme}
            />
          ) : null}
        </div>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[520px] items-center justify-around rounded-t-3xl bg-[var(--surface)] px-2 pt-2 shadow-[0_-4px_20px_var(--shadow-dark-soft)] lg:hidden">
        {mobileModules
          .filter(
            (moduleKey) =>
              moduleKey === "dashboard" || moduleKey === "settings" || data.settings.enabledModules.includes(moduleKey),
          )
          .map((moduleKey) => {
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
      <FeedbackDialog dialog={dialog} onClose={closeDialog} />
    </div>
  );
}

function ProfileFooter({
  online,
  syncMessage,
  syncStatus,
  user,
}: {
  online: boolean;
  syncMessage: string;
  syncStatus: NexoSyncStatus;
  user: WorkspaceUser;
}) {
  const statusLabel =
    syncStatus === "synced"
      ? "Nube activa"
      : syncStatus === "syncing" || syncStatus === "loading"
        ? "Sincronizando"
        : syncStatus === "error"
          ? "Revisar sync"
          : "Modo local";

  return (
    <div className="space-y-3 border-t border-[var(--surface-container)] pt-4">
      <div className="nexo-surface flex items-center justify-between rounded-3xl p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary-strong)]">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-[var(--muted-soft)]">{user.email}</p>
            <p className="text-xs text-[var(--muted-soft)]">{online ? statusLabel : "Sin conexión"}</p>
          </div>
        </div>
        <form action={signOut}>
          <Button aria-label="Cerrar sesión" size="icon" title="Cerrar sesión" variant="ghost">
            <LogOut aria-hidden className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <div className="nexo-inset rounded-2xl px-3 py-2 text-xs font-bold text-[var(--primary)]">
        {online ? syncMessage : "Cambios guardados offline"}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NX";
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
          <CardDescription>Resultados sincronizados en tu espacio.</CardDescription>
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
              <CardDescription>Archivos y detalles sincronizados de forma segura.</CardDescription>
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
  onDeleteNote: (note: Note) => void;
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
                  <Button aria-label={`Eliminar ${note.title}`} onClick={() => onDeleteNote(note)} size="icon" title="Eliminar nota" variant="ghost">
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
        {!notes.length ? <EmptyState icon={FileText} message="Todavía no hay notas. Crea la primera desde el formulario." /> : null}
      </div>
    </div>
  );
}

function TasksView({
  tasks,
  spaces,
  addTask,
  onDelete,
  onUpdateStatus,
}: {
  tasks: Task[];
  spaces: Space[];
  addTask: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardTitle>Nueva tarea</CardTitle>
        <form className="mt-4 grid gap-3 xl:grid-cols-[1fr_1fr_140px_160px_180px_auto]" onSubmit={addTask}>
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
          <SpaceSelect spaces={spaces} />
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
                      <div className="mt-3 flex flex-wrap items-center gap-2">
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
                        <Button
                          aria-label={`Eliminar ${task.title}`}
                          className="ml-auto"
                          onClick={() => onDelete(task)}
                          size="icon"
                          title="Eliminar tarea"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              {!tasks.some((task) => task.status === status) ? (
                <p className="py-8 text-center text-sm text-[var(--muted)]">Sin tareas en esta columna.</p>
              ) : null}
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

function DriveView({
  driveFiles,
  onDelete,
  onOpen,
  onUpload,
}: {
  driveFiles: DriveFile[];
  onDelete: (file: DriveFile) => Promise<void>;
  onOpen: (file: DriveFile) => Promise<void>;
  onUpload: (files: FileList | null) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Drive</CardTitle>
            <CardDescription>Sube archivos a tu espacio privado y mantén sus detalles sincronizados.</CardDescription>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] nexo-primary-shadow">
            <Upload className="h-4 w-4" />
            Subir archivo
            <input
              className="sr-only"
              multiple
              onChange={(event) => {
                void onUpload(event.target.files);
                event.currentTarget.value = "";
              }}
              type="file"
            />
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
            <p className="mt-2 truncate text-xs text-[var(--muted-soft)]">
              {file.storagePath ? "Guardado en la nube" : "Sólo en este dispositivo"}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                disabled={!file.storagePath}
                onClick={() => void onOpen(file)}
                size="sm"
              >
                <ExternalLink aria-hidden className="h-4 w-4" />
                Abrir
              </Button>
              <Button
                aria-label={`Eliminar ${file.name}`}
                onClick={() => void onDelete(file)}
                size="icon"
                title="Eliminar archivo"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {!driveFiles.length ? <EmptyState icon={FolderOpen} message="No hay archivos. Sube uno para guardarlo de forma privada." /> : null}
      </div>
    </div>
  );
}

function CalendarView({
  events,
  spaces,
  addEvent,
  onDelete,
}: {
  events: CalendarEvent[];
  spaces: Space[];
  addEvent: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: (event: CalendarEvent) => void;
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
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary-strong)]">
                      {space?.name ?? "General"}
                    </span>
                    <Button
                      aria-label={`Eliminar ${event.title}`}
                      onClick={() => onDelete(event)}
                      size="icon"
                      title="Eliminar evento"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {formatDate(event.startsAt)} - {formatDate(event.endsAt)}
                </p>
              </Card>
            );
          })}
        {!events.length ? <EmptyState icon={CalendarDays} message="No hay eventos programados." /> : null}
      </div>
    </div>
  );
}

function SpacesView({
  spaces,
  notes,
  tasks,
  addSpace,
  onDelete,
}: {
  spaces: Space[];
  notes: Note[];
  tasks: Task[];
  addSpace: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: (space: Space) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-5">
        <CardTitle>Nuevo espacio</CardTitle>
        <form className="mt-4 space-y-3" onSubmit={addSpace}>
          <Input name="name" placeholder="Nombre" required />
          <Input name="description" placeholder="Descripción" />
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Icono</legend>
            <div className="grid grid-cols-5 gap-2">
              {spaceIconOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <label className="cursor-pointer" key={option.value} title={option.label}>
                    <input
                      className="peer sr-only"
                      defaultChecked={index === 0}
                      name="icon"
                      type="radio"
                      value={option.value}
                    />
                    <span className="nexo-surface-sm flex h-10 items-center justify-center rounded-xl text-[var(--muted)] transition peer-checked:bg-[var(--primary)] peer-checked:text-[var(--primary-foreground)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]">
                      <Icon aria-hidden className="h-5 w-5" />
                      <span className="sr-only">{option.label}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
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
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${space.color}20`, color: space.color }}
                >
                  <SpaceIcon value={space.icon} />
                </span>
                <h2 className="mt-3 font-display text-lg font-bold">{space.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{space.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: space.color }} />
                <Button
                  aria-label={`Eliminar ${space.name}`}
                  onClick={() => onDelete(space)}
                  size="icon"
                  title="Eliminar espacio"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
        {!spaces.length ? <EmptyState icon={Sparkles} message="No hay espacios. Crea uno para agrupar tu trabajo." /> : null}
      </div>
    </div>
  );
}

function SavedView({
  items,
  spaces,
  addSavedItem,
  onDelete,
  onToggleFavorite,
}: {
  items: SavedItem[];
  spaces: Space[];
  addSavedItem: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: (item: SavedItem) => void;
  onToggleFavorite: (itemId: string) => void;
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
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={item.isFavorite ? `Quitar ${item.title} de favoritos` : `Marcar ${item.title} como favorito`}
                    onClick={() => onToggleFavorite(item.id)}
                    size="icon"
                    title={item.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                    variant="ghost"
                  >
                    <Star className="h-4 w-4" fill={item.isFavorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    aria-label={`Eliminar ${item.title}`}
                    onClick={() => onDelete(item)}
                    size="icon"
                    title="Eliminar enlace"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
        {!items.length ? <EmptyState icon={Bookmark} message="No hay enlaces guardados." /> : null}
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
  onDeleteList,
}: {
  lists: NexoData["lists"];
  items: NexoData["listItems"];
  spaces: Space[];
  setData: React.Dispatch<React.SetStateAction<NexoData>>;
  addList: (event: React.FormEvent<HTMLFormElement>) => void;
  addListItem: (event: React.FormEvent<HTMLFormElement>, listId: string) => void;
  onDeleteList: (list: NexoList) => void;
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
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{list.name}</CardTitle>
              <Button
                aria-label={`Eliminar ${list.name}`}
                onClick={() => onDeleteList(list)}
                size="icon"
                title="Eliminar lista"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {items
                .filter((item) => item.listId === list.id)
                .sort((first, second) => first.position - second.position)
                .map((item) => (
                  <div className="flex items-center gap-1 rounded-2xl hover:bg-[var(--surface-container-low)]" key={item.id}>
                    <button
                      className="flex min-w-0 flex-1 items-center gap-3 p-2 text-left"
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
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-[var(--muted)]" />
                      )}
                      <span className={item.completed ? "truncate text-sm line-through text-[var(--muted-soft)]" : "truncate text-sm font-medium"}>
                        {item.text}
                      </span>
                    </button>
                    <Button
                      aria-label={`Eliminar ${item.text}`}
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          listItems: current.listItems.filter((listItem) => listItem.id !== item.id),
                        }))
                      }
                      size="icon"
                      title="Eliminar elemento"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              {!items.some((item) => item.listId === list.id) ? (
                <p className="py-4 text-center text-sm text-[var(--muted)]">La lista está vacía.</p>
              ) : null}
            </div>
            <form className="mt-4 flex gap-2" onSubmit={(event) => addListItem(event, list.id)}>
              <Input name="text" placeholder="Añadir item" required />
              <Button aria-label="Añadir" size="icon" type="submit" variant="primary">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        ))}
        {!lists.length ? <EmptyState icon={ListChecks} message="No hay listas. Crea una para empezar." /> : null}
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
              <CardDescription>Preferencias visuales guardadas en tu cuenta.</CardDescription>
            </div>
          </CardHeader>
          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-sm font-bold">Tema</p>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <Button
                    aria-pressed={settings.theme === theme}
                    key={theme}
                    onClick={() => updateTheme(theme)}
                    variant={settings.theme === theme ? "primary" : "secondary"}
                  >
                    {theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : null}
                    {theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema"}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Color de acento</p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                {accentPalette.map((option) => (
                  <button
                    aria-label={`Usar color ${option.label}`}
                    aria-pressed={accent === option.key}
                    className="group flex min-w-0 flex-col items-center gap-2 text-xs font-semibold text-[var(--muted)]"
                    key={option.key}
                    onClick={() => updateAccent(option.key)}
                    title={option.label}
                    type="button"
                  >
                    <span
                      className={
                        accent === option.key
                          ? "flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[var(--foreground)] shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--primary)]"
                          : "flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/60 shadow-sm transition-transform group-hover:scale-105"
                      }
                      style={{ backgroundColor: option.color }}
                    >
                      {accent === option.key ? <Check aria-hidden className="h-5 w-5 text-white drop-shadow-sm" strokeWidth={3} /> : null}
                    </span>
                    <span className="truncate">{option.label}</span>
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
                  <div
                    className={
                      enabled
                        ? "flex items-center justify-between rounded-2xl border border-[color-mix(in_srgb,var(--primary)_45%,transparent)] bg-[var(--primary-soft)] p-3"
                        : "nexo-surface-sm flex items-center justify-between rounded-2xl border border-transparent p-3"
                    }
                    key={module.key}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[var(--primary)]" />
                      <div>
                        <span className="block text-sm font-bold">{module.label}</span>
                        <span className="block text-xs text-[var(--muted)]">{enabled ? "Activo" : "Inactivo"}</span>
                      </div>
                    </div>
                    <Switch
                      aria-label={`${enabled ? "Desactivar" : "Activar"} ${module.label}`}
                      checked={enabled}
                      onClick={() => toggleModule(module.key)}
                    />
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Datos del workspace</CardTitle>
            <CardDescription>Esto reemplaza tu workspace con los datos iniciales de ejemplo.</CardDescription>
          </div>
          <Button onClick={onReset}>
            <RotateCcw aria-hidden className="h-4 w-4" />
            Restablecer datos
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Home; message: string }) {
  return (
    <div className="nexo-inset col-span-full flex min-h-36 flex-col items-center justify-center rounded-2xl p-6 text-center">
      <Icon aria-hidden className="h-7 w-7 text-[var(--primary)]" />
      <p className="mt-3 max-w-sm text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}
