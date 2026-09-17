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
      "profile",
      "settings",
    ],
    readNotificationIds: [],
    confirmedOAuthProviders: [],
  },
};

export function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ ((Math.random() * 16) >> (Number(char) / 4))).toString(16),
  );
}

export function createId() {
  return createUuid();
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
