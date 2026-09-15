export type ModuleKey =
  | "dashboard"
  | "notes"
  | "drive"
  | "tasks"
  | "calendar"
  | "spaces"
  | "saved"
  | "lists"
  | "focus"
  | "settings";

export type TaskStatus = "todo" | "in_progress" | "completed";
export type Priority = "low" | "medium" | "high";
export type SavedItemType = "article" | "video" | "repository" | "document" | "link" | "other";

export type Space = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  spaceId: string | null;
  isFavorite: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  spaceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  endsAt: string;
  spaceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedItem = {
  id: string;
  url: string;
  title: string;
  description: string;
  type: SavedItemType;
  spaceId: string | null;
  isFavorite: boolean;
  createdAt: string;
};

export type NexoList = {
  id: string;
  name: string;
  spaceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NexoListItem = {
  id: string;
  listId: string;
  text: string;
  completed: boolean;
  position: number;
  createdAt: string;
};

export type DriveFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  spaceId: string | null;
  isFavorite: boolean;
  isTrashed: boolean;
  createdAt: string;
};

export type FocusSession = {
  id: string;
  durationMinutes: number;
  completedAt: string;
  spaceId: string | null;
  taskId: string | null;
};

export type UserSettings = {
  theme: "light" | "dark" | "system";
  accentColor: "indigo" | "blue" | "green" | "emerald" | "orange" | "red" | "pink" | "custom";
  interfaceDensity: "comfortable" | "compact";
  animations: boolean;
  shadowIntensity: "soft" | "medium" | "deep";
  enabledModules: ModuleKey[];
};

export type NexoData = {
  spaces: Space[];
  notes: Note[];
  tasks: Task[];
  events: CalendarEvent[];
  savedItems: SavedItem[];
  lists: NexoList[];
  listItems: NexoListItem[];
  driveFiles: DriveFile[];
  focusSessions: FocusSession[];
  settings: UserSettings;
};
