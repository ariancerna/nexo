"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { defaultNexoData, createId } from "@/lib/nexo/default-data";
import {
  createDriveFileSignedUrl,
  createNexoSupabaseClient,
  deleteDriveFileFromSupabase,
  getSupabaseUserId,
  loadNexoDataFromSupabase,
  normalizeNexoDataForSupabase,
  saveNexoDataToSupabase,
  uploadDriveFileToSupabase,
} from "@/lib/nexo/supabase-data";
import type { DriveFile, NexoData } from "@/types/nexo";

const storageKey = "nexo-workspace-v2";
const storageOwnerKey = `${storageKey}-owner`;

export type NexoSyncStatus = "local" | "loading" | "syncing" | "synced" | "error";

function getOperationErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object") {
    const candidate = error as { message?: unknown; details?: unknown; code?: unknown };
    const message = typeof candidate.message === "string" ? candidate.message.trim() : "";
    const details = typeof candidate.details === "string" ? candidate.details.trim() : "";
    const code = typeof candidate.code === "string" ? candidate.code : "";

    if (code === "42501" || /permission denied|row-level security/i.test(`${message} ${details}`)) {
      return "Supabase rechazó el guardado por permisos. Aplica las migraciones pendientes y vuelve a intentarlo.";
    }

    if (/schema cache|does not exist|could not find/i.test(`${message} ${details}`)) {
      return "La base de datos no está actualizada. Aplica las migraciones de Supabase y vuelve a intentarlo.";
    }

    if (message) return details && details !== message ? `${message}: ${details}` : message;
  }

  return fallback;
}

function readLocalData() {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return { data: defaultNexoData, exists: false, ownerId: null };
  }

  try {
    return {
      data: { ...defaultNexoData, ...JSON.parse(stored) } as NexoData,
      exists: true,
      ownerId: window.localStorage.getItem(storageOwnerKey),
    };
  } catch {
    return { data: defaultNexoData, exists: false, ownerId: null };
  }
}

function mergeEntities<T extends { id: string }>(
  remote: T[],
  local: T[],
  timestamp: (item: T) => string,
) {
  const merged = new Map(remote.map((item) => [item.id, item]));

  for (const localItem of local) {
    const remoteItem = merged.get(localItem.id);
    const localTimestamp = Date.parse(timestamp(localItem));
    const remoteTimestamp = remoteItem ? Date.parse(timestamp(remoteItem)) : Number.NEGATIVE_INFINITY;
    if (!remoteItem || Number.isNaN(remoteTimestamp) || localTimestamp >= remoteTimestamp) {
      merged.set(localItem.id, localItem);
    }
  }

  return Array.from(merged.values());
}

function mergeNexoData(remote: NexoData, local: NexoData) {
  return normalizeNexoDataForSupabase({
    spaces: mergeEntities(remote.spaces, local.spaces, (item) => item.updatedAt),
    notes: mergeEntities(remote.notes, local.notes, (item) => item.updatedAt),
    tasks: mergeEntities(remote.tasks, local.tasks, (item) => item.updatedAt),
    events: mergeEntities(remote.events, local.events, (item) => item.updatedAt),
    savedItems: mergeEntities(remote.savedItems, local.savedItems, (item) => item.updatedAt),
    lists: mergeEntities(remote.lists, local.lists, (item) => item.updatedAt),
    listItems: mergeEntities(remote.listItems, local.listItems, (item) => item.updatedAt),
    driveFiles: mergeEntities(remote.driveFiles, local.driveFiles, (item) => item.updatedAt),
    focusSessions: mergeEntities(remote.focusSessions, local.focusSessions, (item) => item.completedAt),
    settings: {
      ...local.settings,
      readNotificationIds: Array.from(
        new Set([...remote.settings.readNotificationIds, ...local.settings.readNotificationIds]),
      ),
      confirmedOAuthProviders: Array.from(
        new Set([...remote.settings.confirmedOAuthProviders, ...local.settings.confirmedOAuthProviders]),
      ),
    },
  });
}

function createLocalDriveFile(file: File): DriveFile {
  const createdAt = new Date().toISOString();
  return {
    id: createId(),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    storagePath: null,
    spaceId: null,
    isFavorite: false,
    isTrashed: false,
    createdAt,
    updatedAt: createdAt,
  };
}

export function useNexoData() {
  const [data, setData] = useState<NexoData>(defaultNexoData);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<NexoSyncStatus>("local");
  const [syncMessage, setSyncMessage] = useState("Modo local");
  const [userId, setUserId] = useState<string | null>(null);
  const [retryRevision, setRetryRevision] = useState(0);
  const [saveRetryRevision, setSaveRetryRevision] = useState(0);
  const [saveConfirmation, setSaveConfirmation] = useState(0);
  const lastRemoteSnapshot = useRef("");
  const latestSnapshot = useRef("");
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);
  const initialized = useRef(false);
  const lastRetry = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const local = readLocalData();
      const localData = normalizeNexoDataForSupabase(local.data);
      setUserId(null);
      setData(localData);
      setSyncStatus("loading");
      setSyncMessage("Cargando tu espacio");

      try {
        const supabase = createNexoSupabaseClient();
        const nextUserId = await getSupabaseUserId(supabase);

        if (!nextUserId) {
          if (!cancelled) {
            setSyncStatus("local");
            setSyncMessage("Inicia sesion para sincronizar");
          }
          return;
        }

        const remoteData = await loadNexoDataFromSupabase(supabase);
        const canMergeLocal = local.exists && (!local.ownerId || local.ownerId === nextUserId);
        const nextData = canMergeLocal ? mergeNexoData(remoteData, localData) : remoteData;
        const remoteSnapshot = JSON.stringify(remoteData);
        const snapshot = JSON.stringify(nextData);

        if (!cancelled) {
          setUserId(nextUserId);
          setData(nextData);
          window.localStorage.setItem(storageKey, snapshot);
          window.localStorage.setItem(storageOwnerKey, nextUserId);
          lastRemoteSnapshot.current = remoteSnapshot;
          latestSnapshot.current = snapshot;
          lastRetry.current = null;
          setSyncStatus(snapshot === remoteSnapshot ? "synced" : "syncing");
          setSyncMessage(snapshot === remoteSnapshot ? "Sincronizado" : "Combinando cambios locales");
        }
      } catch (error) {
        if (!cancelled) {
          lastRetry.current = () => setRetryRevision((current) => current + 1);
          setSyncStatus("error");
          setSyncMessage(getOperationErrorMessage(error, "No se pudo sincronizar con la nube"));
        }
      } finally {
        if (!cancelled) {
          initialized.current = true;
          setReady(true);
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [retryRevision]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const snapshot = JSON.stringify(data);
    latestSnapshot.current = snapshot;
    window.localStorage.setItem(storageKey, snapshot);
  }, [data, ready]);

  useEffect(() => {
    if (!ready || !initialized.current || !userId) {
      return;
    }

    const snapshot = JSON.stringify(data);

    if (snapshot === lastRemoteSnapshot.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSyncStatus("syncing");
      setSyncMessage("Guardando cambios");

      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          try {
            const savedData = await saveNexoDataToSupabase(userId, data);
            const nextSnapshot = JSON.stringify(savedData);
            lastRemoteSnapshot.current = nextSnapshot;

            if (mounted.current && latestSnapshot.current === snapshot) {
              setData(savedData);
              window.localStorage.setItem(storageKey, nextSnapshot);
              window.localStorage.setItem(storageOwnerKey, userId);
              lastRetry.current = null;
              setSyncStatus("synced");
              setSyncMessage("Sincronizado");
              setSaveConfirmation((current) => current + 1);
            }
          } catch (error: unknown) {
            if (mounted.current && latestSnapshot.current === snapshot) {
              console.error("No se pudo guardar Nexo en Supabase", error);
              lastRetry.current = () => setSaveRetryRevision((current) => current + 1);
              setSyncStatus("error");
              setSyncMessage(
                getOperationErrorMessage(
                  error,
                  "No se pudo guardar en la nube. Tus cambios siguen seguros en este dispositivo.",
                ),
              );
            }
          }
        });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [data, ready, saveRetryRevision, userId]);

  const uploadDriveFiles = useCallback(
    async (files: FileList | null, spaceId: string | null = null) => {
      if (!files?.length) {
        return [];
      }

      const fileList = Array.from(files);

      if (!userId) {
        return fileList.map(createLocalDriveFile);
      }

      try {
        setSyncStatus("syncing");
        setSyncMessage("Subiendo archivos");
        const uploaded = await Promise.all(fileList.map((file) => uploadDriveFileToSupabase(userId, file)));
        lastRetry.current = null;
        return uploaded;
      } catch (error) {
        lastRetry.current = async () => {
          setSyncStatus("syncing");
          setSyncMessage("Reintentando subida");
          try {
            const uploaded = await Promise.all(fileList.map((file) => uploadDriveFileToSupabase(userId, file)));
            setData((current) => ({
              ...current,
              driveFiles: [...uploaded.map((file) => ({ ...file, spaceId })), ...current.driveFiles],
            }));
            lastRetry.current = null;
          } catch (retryError) {
            setSyncStatus("error");
            setSyncMessage(getOperationErrorMessage(retryError, "No se pudieron subir los archivos"));
          }
        };
        setSyncStatus("error");
        setSyncMessage(getOperationErrorMessage(error, "No se pudieron subir los archivos"));
        return [];
      }
    },
    [userId],
  );

  const actions = useMemo(
    () => ({
      setData,
      uploadDriveFiles,
      openDriveFile: async (file: DriveFile) => {
        if (!file.storagePath) {
          setSyncStatus("error");
          setSyncMessage("Este archivo sólo tiene metadata local");
          return;
        }

        try {
          const signedUrl = await createDriveFileSignedUrl(file.storagePath);
          window.location.assign(signedUrl);
        } catch (error) {
          lastRetry.current = () => actions.openDriveFile(file);
          setSyncStatus("error");
          setSyncMessage(getOperationErrorMessage(error, "No se pudo abrir el archivo"));
        }
      },
      deleteDriveFile: async (file: DriveFile) => {
        try {
          if (file.storagePath) {
            await deleteDriveFileFromSupabase(file.storagePath);
          }

          setData((current) => ({
            ...current,
            driveFiles: current.driveFiles.filter((currentFile) => currentFile.id !== file.id),
          }));
        } catch (error) {
          lastRetry.current = () => actions.deleteDriveFile(file);
          setSyncStatus("error");
          setSyncMessage(getOperationErrorMessage(error, "No se pudo eliminar el archivo"));
        }
      },
      resetData: () =>
        setData((current) => {
          const reset = normalizeNexoDataForSupabase(defaultNexoData);
          return {
            ...reset,
            settings: current.settings,
          };
        }),
      retryLastOperation: () => {
        const retry = lastRetry.current;
        if (retry) void retry();
        else setRetryRevision((current) => current + 1);
      },
    }),
    [uploadDriveFiles],
  );

  return { data, ready, syncStatus, syncMessage, saveConfirmation, ...actions };
}
