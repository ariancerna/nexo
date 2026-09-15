import type { NexoData } from "@/types/nexo";

const now = new Date().toISOString();

export const defaultNexoData: NexoData = {
  spaces: [
    {
      id: "space-university",
      name: "Universidad",
      description: "Clases, entregas, lecturas y material académico.",
      icon: "🎓",
      color: "#4f46e5",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "space-code",
      name: "Programación",
      description: "Proyectos, documentación técnica e ideas de producto.",
      icon: "💻",
      color: "#059669",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "space-personal",
      name: "Personal",
      description: "Rutinas, pendientes personales y planificación.",
      icon: "🏠",
      color: "#d97706",
      createdAt: now,
      updatedAt: now,
    },
  ],
  notes: [
    {
      id: "note-architecture",
      title: "Arquitectura del Proyecto Nexo",
      content:
        "Base modular con App Router, tokens visuales, Supabase preparado y almacenamiento local para una primera experiencia funcional.",
      spaceId: "space-code",
      isFavorite: true,
      isTrashed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note-distributed-systems",
      title: "Seminario de Sistemas Distribuidos",
      content: "Repasar consenso Raft, tolerancia a fallos y diferencias prácticas frente a Paxos.",
      spaceId: "space-university",
      isFavorite: false,
      isTrashed: false,
      createdAt: now,
      updatedAt: now,
    },
  ],
  tasks: [
    {
      id: "task-review-paper",
      title: "Revisar paper sobre arquitecturas neumórficas",
      description: "Marcar ideas que puedan aplicarse al sistema visual de Nexo.",
      status: "todo",
      priority: "high",
      dueDate: new Date().toISOString().slice(0, 10),
      spaceId: "space-university",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "task-refactor-shell",
      title: "Refactorizar shell responsive",
      description: "Separar datos compartidos de variantes desktop/mobile.",
      status: "in_progress",
      priority: "medium",
      dueDate: "",
      spaceId: "space-code",
      createdAt: now,
      updatedAt: now,
    },
  ],
  events: [
    {
      id: "event-sprint-review",
      title: "Sprint review",
      location: "Google Meet",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      spaceId: "space-code",
      createdAt: now,
      updatedAt: now,
    },
  ],
  savedItems: [
    {
      id: "saved-next-docs",
      url: "https://nextjs.org/docs",
      title: "Next.js Docs",
      description: "Referencia para App Router, rutas y patrones de rendering.",
      type: "document",
      spaceId: "space-code",
      isFavorite: true,
      createdAt: now,
    },
  ],
  lists: [
    {
      id: "list-week",
      name: "Plan semanal",
      spaceId: "space-personal",
      createdAt: now,
      updatedAt: now,
    },
  ],
  listItems: [
    {
      id: "list-item-1",
      listId: "list-week",
      text: "Ordenar prioridades del lunes",
      completed: false,
      position: 1,
      createdAt: now,
    },
    {
      id: "list-item-2",
      listId: "list-week",
      text: "Preparar bloque de estudio",
      completed: true,
      position: 2,
      createdAt: now,
    },
  ],
  driveFiles: [
    {
      id: "file-readme",
      name: "README_v2.md",
      size: 32768,
      type: "text/markdown",
      storagePath: null,
      spaceId: "space-code",
      isFavorite: false,
      isTrashed: false,
      createdAt: now,
    },
  ],
  focusSessions: [],
  settings: {
    theme: "system",
    accentColor: "indigo",
    interfaceDensity: "comfortable",
    animations: true,
    shadowIntensity: "medium",
    enabledModules: [
      "dashboard",
      "notes",
      "drive",
      "tasks",
      "calendar",
      "spaces",
      "saved",
      "lists",
      "focus",
      "settings",
    ],
  },
};

export function createId(_prefix: string) {
  void _prefix;

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
