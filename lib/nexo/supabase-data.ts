"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { defaultNexoData } from "@/lib/nexo/default-data";
import type {
  CalendarEvent,
  DriveFile,
  ModuleKey,
  NexoData,
  NexoList,
  NexoListItem,
  Note,
  Priority,
  SavedItem,
  SavedItemType,
  Space,
  Task,
  TaskStatus,
  UserSettings,
} from "@/types/nexo";
import type { Database, Json } from "@/types/database";

type NexoSupabaseClient = SupabaseClient<Database>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SyncTable =
  | "focus_sessions"
  | "list_items"
  | "files"
  | "folders"
  | "notes"
  | "tasks"
  | "events"
  | "saved_items"
  | "lists"
  | "spaces";

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16),
  );
}

function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function cloneData(data: NexoData): NexoData {
  return JSON.parse(JSON.stringify(data)) as NexoData;
}

function toNullableUuid(value: string | null | undefined, idMap: Map<string, string>) {
  if (!value) {
    return null;
  }

  return idMap.get(value) ?? (isUuid(value) ? value : null);
}

function ensureUuid(value: string, idMap: Map<string, string>) {
  if (isUuid(value)) {
    return value;
  }

  const existing = idMap.get(value);

  if (existing) {
    return existing;
  }

  const nextId = createUuid();
  idMap.set(value, nextId);
  return nextId;
}

function normalizeModuleList(value: unknown): ModuleKey[] {
  const fallback = defaultNexoData.settings.enabledModules;

  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is ModuleKey => fallback.includes(item as ModuleKey));
}

function normalizeSettings(value: Json | UserSettings | null | undefined): UserSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultNexoData.settings;
  }

  const candidate = value as Partial<UserSettings> & {
    accent_color?: UserSettings["accentColor"];
    enabled_modules?: ModuleKey[];
    interface_density?: UserSettings["interfaceDensity"];
    shadow_intensity?: UserSettings["shadowIntensity"];
  };

  return {
    ...defaultNexoData.settings,
    ...candidate,
    accentColor: candidate.accentColor ?? candidate.accent_color ?? defaultNexoData.settings.accentColor,
    enabledModules: normalizeModuleList(candidate.enabledModules ?? candidate.enabled_modules),
    interfaceDensity:
      candidate.interfaceDensity ?? candidate.interface_density ?? defaultNexoData.settings.interfaceDensity,
    shadowIntensity: candidate.shadowIntensity ?? candidate.shadow_intensity ?? defaultNexoData.settings.shadowIntensity,
  };
}

function settingsToPreferences(settings: UserSettings): Json {
  return {
    theme: settings.theme,
    accent_color: settings.accentColor,
    interface_density: settings.interfaceDensity,
    animations: settings.animations,
    shadow_intensity: settings.shadowIntensity,
    enabled_modules: settings.enabledModules,
  };
}

export function normalizeNexoDataForSupabase(input: NexoData): NexoData {
  const data = cloneData(input);
  const spaceIds = new Map<string, string>();
  const taskIds = new Map<string, string>();
  const listIds = new Map<string, string>();
  const fileIds = new Map<string, string>();

  data.spaces = data.spaces.map((space) => {
    const id = ensureUuid(space.id, spaceIds);
    return { ...space, id };
  });

  data.notes = data.notes.map((note) => ({
    ...note,
    id: ensureUuid(note.id, new Map([[note.id, isUuid(note.id) ? note.id : createUuid()]])),
    spaceId: toNullableUuid(note.spaceId, spaceIds),
  }));

  data.tasks = data.tasks.map((task) => {
    const id = ensureUuid(task.id, taskIds);
    return { ...task, id, spaceId: toNullableUuid(task.spaceId, spaceIds) };
  });

  data.events = data.events.map((event) => ({
    ...event,
    id: ensureUuid(event.id, new Map([[event.id, isUuid(event.id) ? event.id : createUuid()]])),
    spaceId: toNullableUuid(event.spaceId, spaceIds),
  }));

  data.savedItems = data.savedItems.map((item) => ({
    ...item,
    id: ensureUuid(item.id, new Map([[item.id, isUuid(item.id) ? item.id : createUuid()]])),
    spaceId: toNullableUuid(item.spaceId, spaceIds),
  }));

  data.lists = data.lists.map((list) => {
    const id = ensureUuid(list.id, listIds);
    return { ...list, id, spaceId: toNullableUuid(list.spaceId, spaceIds) };
  });

  data.listItems = data.listItems.map((item) => ({
    ...item,
    id: ensureUuid(item.id, new Map([[item.id, isUuid(item.id) ? item.id : createUuid()]])),
    listId: listIds.get(item.listId) ?? item.listId,
  }));

  data.driveFiles = data.driveFiles.map((file) => {
    const id = ensureUuid(file.id, fileIds);
    return { ...file, id, spaceId: toNullableUuid(file.spaceId, spaceIds), storagePath: file.storagePath ?? null };
  });

  data.focusSessions = data.focusSessions.map((session) => ({
    ...session,
    id: ensureUuid(session.id, new Map([[session.id, isUuid(session.id) ? session.id : createUuid()]])),
    spaceId: toNullableUuid(session.spaceId, spaceIds),
    taskId: toNullableUuid(session.taskId, taskIds),
  }));

  data.settings = normalizeSettings(data.settings);
  return data;
}

function hasWorkspaceRows(data: NexoData) {
  return (
    data.spaces.length +
      data.notes.length +
      data.tasks.length +
      data.events.length +
      data.savedItems.length +
      data.lists.length +
      data.listItems.length +
      data.driveFiles.length +
      data.focusSessions.length >
    0
  );
}

function safeSavedItemType(value: string): SavedItemType {
  const valid: SavedItemType[] = ["article", "video", "repository", "document", "link", "other"];
  return valid.includes(value as SavedItemType) ? (value as SavedItemType) : "link";
}

function safeTaskStatus(value: string): TaskStatus {
  const valid: TaskStatus[] = ["todo", "in_progress", "completed"];
  return valid.includes(value as TaskStatus) ? (value as TaskStatus) : "todo";
}

function safePriority(value: string): Priority {
  const valid: Priority[] = ["low", "medium", "high"];
  return valid.includes(value as Priority) ? (value as Priority) : "medium";
}

export function createNexoSupabaseClient() {
  return createSupabaseBrowserClient();
}

export async function getSupabaseUserId(supabase: NexoSupabaseClient) {
  const claimsResult = await supabase.auth.getClaims();

  if (claimsResult.data?.claims?.sub) {
    return claimsResult.data.claims.sub;
  }

  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return null;
  }

  return userResult.data.user.id;
}

export async function loadNexoDataFromSupabase(supabase: NexoSupabaseClient): Promise<NexoData> {
  const [
    spacesResult,
    notesResult,
    tasksResult,
    eventsResult,
    savedItemsResult,
    listsResult,
    listItemsResult,
    filesResult,
    focusSessionsResult,
    settingsResult,
  ] = await Promise.all([
    supabase.from("spaces").select("*").order("created_at", { ascending: true }),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("starts_at", { ascending: true }),
    supabase.from("saved_items").select("*").order("created_at", { ascending: false }),
    supabase.from("lists").select("*").order("created_at", { ascending: false }),
    supabase.from("list_items").select("*").order("position", { ascending: true }),
    supabase.from("files").select("*").order("created_at", { ascending: false }),
    supabase.from("focus_sessions").select("*").order("created_at", { ascending: false }),
    supabase.from("user_settings").select("preferences").maybeSingle(),
  ]);

  const results = [
    spacesResult,
    notesResult,
    tasksResult,
    eventsResult,
    savedItemsResult,
    listsResult,
    listItemsResult,
    filesResult,
    focusSessionsResult,
    settingsResult,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }

  const spaces: Space[] = (spacesResult.data ?? []).map((space) => ({
    id: space.id,
    name: space.name,
    description: space.description,
    icon: space.icon,
    color: space.color,
    createdAt: space.created_at,
    updatedAt: space.updated_at,
  }));
  const notes: Note[] = (notesResult.data ?? []).map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    spaceId: note.space_id,
    isFavorite: note.is_favorite,
    isTrashed: note.is_trashed,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }));
  const tasks: Task[] = (tasksResult.data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: safeTaskStatus(task.status),
    priority: safePriority(task.priority),
    dueDate: task.due_date ?? "",
    spaceId: task.space_id,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }));
  const events: CalendarEvent[] = (eventsResult.data ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    location: event.location,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    spaceId: event.space_id,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }));
  const savedItems: SavedItem[] = (savedItemsResult.data ?? []).map((item) => ({
    id: item.id,
    url: item.url,
    title: item.title,
    description: item.description,
    type: safeSavedItemType(item.type),
    spaceId: item.space_id,
    isFavorite: item.is_favorite,
    createdAt: item.created_at,
  }));
  const lists: NexoList[] = (listsResult.data ?? []).map((list) => ({
    id: list.id,
    name: list.name,
    spaceId: list.space_id,
    createdAt: list.created_at,
    updatedAt: list.updated_at,
  }));
  const listItems: NexoListItem[] = (listItemsResult.data ?? []).map((item) => ({
    id: item.id,
    listId: item.list_id,
    text: item.text,
    completed: item.completed,
    position: item.position,
    createdAt: item.created_at,
  }));
  const driveFiles: DriveFile[] = (filesResult.data ?? []).map((file) => ({
    id: file.id,
    name: file.filename,
    size: file.size_bytes,
    type: file.mime_type ?? "application/octet-stream",
    storagePath: file.storage_path,
    spaceId: file.space_id,
    isFavorite: file.is_favorite,
    isTrashed: file.is_trashed,
    createdAt: file.created_at,
  }));
  const focusSessions = (focusSessionsResult.data ?? []).map((session) => ({
    id: session.id,
    durationMinutes: session.duration_minutes,
    completedAt: session.completed_at ?? session.created_at,
    spaceId: session.space_id,
    taskId: session.task_id,
  }));
  const settings = normalizeSettings(settingsResult.data?.preferences);

  return { spaces, notes, tasks, events, savedItems, lists, listItems, driveFiles, focusSessions, settings };
}

async function upsertRows<T>(table: keyof Database["public"]["Tables"], rows: T[]) {
  if (!rows.length) {
    return;
  }

  const supabase = createNexoSupabaseClient();
  const { error } = await supabase.from(table).upsert(rows as never, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

async function deleteMissing(table: SyncTable, ids: string[]) {
  const supabase = createNexoSupabaseClient();
  const query = supabase.from(table).delete();
  const result = ids.length ? await query.not("id", "in", `(${ids.join(",")})`) : await query;

  if (result.error) {
    throw result.error;
  }
}

export async function saveNexoDataToSupabase(userId: string, input: NexoData) {
  const data = normalizeNexoDataForSupabase(input);
  const supabase = createNexoSupabaseClient();

  const { error: settingsError } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      preferences: settingsToPreferences(data.settings),
    },
    { onConflict: "user_id" },
  );

  if (settingsError) {
    throw settingsError;
  }

  await upsertRows(
    "spaces",
    data.spaces.map((space) => ({
      id: space.id,
      user_id: userId,
      name: space.name,
      description: space.description,
      icon: space.icon,
      color: space.color,
      created_at: space.createdAt,
      updated_at: space.updatedAt,
    })),
  );
  await upsertRows(
    "notes",
    data.notes.map((note) => ({
      id: note.id,
      user_id: userId,
      space_id: note.spaceId,
      title: note.title,
      content: note.content,
      is_favorite: note.isFavorite,
      is_trashed: note.isTrashed,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    })),
  );
  await upsertRows(
    "tasks",
    data.tasks.map((task) => ({
      id: task.id,
      user_id: userId,
      space_id: task.spaceId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate || null,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    })),
  );
  await upsertRows(
    "events",
    data.events.map((event) => ({
      id: event.id,
      user_id: userId,
      space_id: event.spaceId,
      title: event.title,
      description: "",
      location: event.location,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
    })),
  );
  await upsertRows(
    "saved_items",
    data.savedItems.map((item) => ({
      id: item.id,
      user_id: userId,
      space_id: item.spaceId,
      url: item.url,
      title: item.title,
      description: item.description,
      type: item.type,
      is_favorite: item.isFavorite,
      created_at: item.createdAt,
      updated_at: item.createdAt,
    })),
  );
  await upsertRows(
    "lists",
    data.lists.map((list) => ({
      id: list.id,
      user_id: userId,
      space_id: list.spaceId,
      name: list.name,
      created_at: list.createdAt,
      updated_at: list.updatedAt,
    })),
  );
  await upsertRows(
    "list_items",
    data.listItems.map((item) => ({
      id: item.id,
      user_id: userId,
      list_id: item.listId,
      text: item.text,
      completed: item.completed,
      position: item.position,
      created_at: item.createdAt,
      updated_at: item.createdAt,
    })),
  );
  await upsertRows(
    "files",
    data.driveFiles.map((file) => ({
      id: file.id,
      user_id: userId,
      space_id: file.spaceId,
      storage_path: file.storagePath ?? `${userId}/${file.id}/${file.name}`,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      is_favorite: file.isFavorite,
      is_trashed: file.isTrashed,
      created_at: file.createdAt,
      updated_at: file.createdAt,
    })),
  );
  await upsertRows(
    "focus_sessions",
    data.focusSessions.map((session) => ({
      id: session.id,
      user_id: userId,
      space_id: session.spaceId,
      task_id: session.taskId,
      duration_minutes: session.durationMinutes,
      completed_at: session.completedAt,
      created_at: session.completedAt,
    })),
  );

  await deleteMissing("focus_sessions", data.focusSessions.map((session) => session.id));
  await deleteMissing("list_items", data.listItems.map((item) => item.id));
  await deleteMissing("files", data.driveFiles.map((file) => file.id));
  await deleteMissing("notes", data.notes.map((note) => note.id));
  await deleteMissing("tasks", data.tasks.map((task) => task.id));
  await deleteMissing("events", data.events.map((event) => event.id));
  await deleteMissing("saved_items", data.savedItems.map((item) => item.id));
  await deleteMissing("lists", data.lists.map((list) => list.id));
  await deleteMissing("spaces", data.spaces.map((space) => space.id));

  return data;
}

export async function seedSupabaseIfEmpty(userId: string, localData: NexoData) {
  const remoteData = await loadNexoDataFromSupabase(createNexoSupabaseClient());

  if (hasWorkspaceRows(remoteData)) {
    return remoteData;
  }

  return saveNexoDataToSupabase(userId, localData);
}

export async function uploadDriveFileToSupabase(userId: string, file: File) {
  const id = createUuid();
  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  const storagePath = `${userId}/${id}/${safeName}`;
  const supabase = createNexoSupabaseClient();
  const { error } = await supabase.storage.from("nexo-files").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const createdAt = new Date().toISOString();

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    storagePath,
    spaceId: null,
    isFavorite: false,
    isTrashed: false,
    createdAt,
  } satisfies DriveFile;
}
