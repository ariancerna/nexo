import type { NexoData } from "@/types/nexo";

export const defaultNexoData: NexoData = {
  spaces: [],
  notes: [],
  tasks: [],
  events: [],
  savedItems: [],
  lists: [],
  listItems: [],
  driveFiles: [],
  focusSessions: [],
  settings: {
    theme: "light",
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
    readNotificationIds: [],
    confirmedOAuthProviders: [],
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
