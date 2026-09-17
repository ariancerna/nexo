"use client";

import { Bell, CalendarDays, Check, CheckCircle2, Clock3, Link2, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dateInputValueInTimeZone, formatNexoDate } from "@/lib/nexo/date";
import type { ModuleKey, NexoData } from "@/types/nexo";

export type WorkspaceNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  module: ModuleKey;
  spaceId: string | null;
  kind: "task" | "event" | "focus" | "saved";
};

export function buildWorkspaceNotifications(data: NexoData, now = new Date(), timeZone?: string): WorkspaceNotification[] {
  const notifications: WorkspaceNotification[] = [];
  const today = dateInputValueInTimeZone(now, timeZone);
  const nowTime = now.getTime();

  for (const task of data.tasks) {
    if (!task.dueDate || task.status === "completed" || task.dueDate > today) continue;
    const overdue = task.dueDate < today;
    notifications.push({
      id: `task-${task.id}-${task.dueDate}`,
      title: overdue ? "Tarea vencida" : "Tarea para hoy",
      description: task.title,
      timestamp: `${task.dueDate}T12:00:00.000Z`,
      module: "tasks",
      spaceId: task.spaceId,
      kind: "task",
    });
  }

  for (const event of data.events) {
    const startsAt = new Date(event.startsAt).getTime();
    const hoursUntilStart = (startsAt - nowTime) / (60 * 60 * 1000);
    if (hoursUntilStart < 0 || hoursUntilStart > 48) continue;
    notifications.push({
      id: `event-${event.id}-${event.startsAt}`,
      title: hoursUntilStart <= 3 ? "Evento próximo" : "Evento en tu agenda",
      description: `${event.title}${event.location ? ` · ${event.location}` : ""}`,
      timestamp: event.startsAt,
      module: "calendar",
      spaceId: event.spaceId,
      kind: "event",
    });
  }

  const sevenDaysAgo = nowTime - 7 * 24 * 60 * 60 * 1000;
  for (const session of data.focusSessions) {
    if (new Date(session.completedAt).getTime() < sevenDaysAgo) continue;
    notifications.push({
      id: `focus-${session.id}`,
      title: "Sesión Focus completada",
      description: `Sumaste ${session.durationMinutes} minutos de concentración.`,
      timestamp: session.completedAt,
      module: "focus",
      spaceId: session.spaceId,
      kind: "focus",
    });
  }

  const urls = new Map<string, typeof data.savedItems>();
  for (const item of data.savedItems) {
    const key = item.url.trim().toLowerCase();
    urls.set(key, [...(urls.get(key) ?? []), item]);
  }
  for (const [url, items] of urls) {
    if (items.length < 2) continue;
    notifications.push({
      id: `saved-duplicate-${encodeURIComponent(url).slice(0, 80)}`,
      title: "Enlace guardado más de una vez",
      description: `${items[0].title} aparece ${items.length} veces.`,
      timestamp: items[0].createdAt,
      module: "saved",
      spaceId: items[0].spaceId,
      kind: "saved",
    });
  }

  return notifications.sort(
    (first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime(),
  );
}

export function NotificationsPanel({
  notifications,
  readIds,
  onRead,
  onReadAll,
  onOpen,
  timeZone,
}: {
  notifications: WorkspaceNotification[];
  readIds: string[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onOpen: (notification: WorkspaceNotification) => void;
  timeZone?: string;
}) {
  const readSet = new Set(readIds);
  const unreadCount = notifications.filter((notification) => !readSet.has(notification.id)).length;

  return (
    <div
      aria-label="Centro de notificaciones"
      className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_22px_60px_var(--shadow-dark)]"
      role="dialog"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div>
          <p className="font-display text-base font-bold">Notificaciones</p>
          <p className="text-xs text-[var(--muted)]">{unreadCount ? `${unreadCount} sin leer` : "Todo al día"}</p>
        </div>
        {unreadCount ? (
          <Button onClick={onReadAll} size="sm" variant="ghost">
            <Check aria-hidden className="h-4 w-4" />
            Marcar todas
          </Button>
        ) : null}
      </div>

      <div className="max-h-[430px] overflow-y-auto p-2">
        {notifications.length ? (
          notifications.map((notification) => {
            const unread = !readSet.has(notification.id);
            const Icon = notificationIcon(notification.kind);

            return (
              <button
                className={
                  unread
                    ? "flex w-full gap-3 rounded-xl bg-[var(--primary-soft)] p-3 text-left transition hover:brightness-95"
                    : "flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-[var(--surface-container-low)]"
                }
                key={notification.id}
                onClick={() => {
                  onRead(notification.id);
                  onOpen(notification);
                }}
                type="button"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)]">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{notification.title}</span>
                    {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" /> : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{notification.description}</span>
                  <span className="mt-1 flex items-center gap-1 text-[0.68rem] text-[var(--muted-soft)]">
                    <Clock3 aria-hidden className="h-3 w-3" />
                    {formatNexoDate(notification.timestamp, timeZone)}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="grid min-h-44 place-items-center p-6 text-center">
            <div>
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <Bell aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold">Sin novedades</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Aquí aparecerán vencimientos, eventos y logros de Focus.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function notificationIcon(kind: WorkspaceNotification["kind"]) {
  if (kind === "task") return CheckCircle2;
  if (kind === "event") return CalendarDays;
  if (kind === "focus") return Timer;
  return Link2;
}
