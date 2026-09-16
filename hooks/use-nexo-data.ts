"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { defaultNexoData, createId } from "@/lib/nexo/default-data";
import {
  createDriveFileSignedUrl,
  createNexoSupabaseClient,
  deleteDriveFileFromSupabase,
  getSupabaseUserId,
  normalizeNexoDataForSupabase,
  saveNexoDataToSupabase,
  seedSupabaseIfEmpty,
  uploadDriveFileToSupabase,
} from "@/lib/nexo/supabase-data";
import type { DriveFile, NexoData } from "@/types/nexo";

const storageKey = "nexo-workspace-v1";

export type NexoSyncStatus = "local" | "loading" | "syncing" | "synced" | "error";

function readLocalData() {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return defaultNexoData;
  }

  try {
    return { ...defaultNexoData, ...JSON.parse(stored) } as NexoData;
  } catch {
    return defaultNexoData;
  }
}

function createLocalDriveFile(file: File): DriveFile {
  return {
    id: createId("file"),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    storagePath: null,
    spaceId: null,
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date().toISOString(),
  };
}

export function useNexoData() {
  const [data, setData] = useState<NexoData>(defaultNexoData);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<NexoSyncStatus>("local");
  const [syncMessage, setSyncMessage] = useState("Modo local");
  const [userId, setUserId] = useState<string | null>(null);
  const lastRemoteSnapshot = useRef("");
  const latestSnapshot = useRef("");
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);
  const initialized = useRef(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const localData = normalizeNexoDataForSupabase(readLocalData());
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

        const remoteData = await seedSupabaseIfEmpty(nextUserId, localData);
        const snapshot = JSON.stringify(remoteData);

        if (!cancelled) {
          setUserId(nextUserId);
          setData(remoteData);
          window.localStorage.setItem(storageKey, snapshot);
          lastRemoteSnapshot.current = snapshot;
          latestSnapshot.current = snapshot;
          setSyncStatus("synced");
          setSyncMessage("Sincronizado");
        }
      } catch (error) {
        if (!cancelled) {
          setSyncStatus("error");
          setSyncMessage(error instanceof Error ? error.message : "No se pudo sincronizar");
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
  }, []);

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

            if (mounted.current && latestSnapshot.current === nextSnapshot) {
              window.localStorage.setItem(storageKey, nextSnapshot);
              setSyncStatus("synced");
              setSyncMessage("Sincronizado");
            }
          } catch (error: unknown) {
            if (mounted.current && latestSnapshot.current === snapshot) {
              setSyncStatus("error");
              setSyncMessage(error instanceof Error ? error.message : "Cambios guardados localmente");
            }
          }
        });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [data, ready, userId]);

  const uploadDriveFiles = useCallback(
    async (files: FileList | null) => {
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
        return await Promise.all(fileList.map((file) => uploadDriveFileToSupabase(userId, file)));
      } catch (error) {
        setSyncStatus("error");
        setSyncMessage(error instanceof Error ? error.message : "No se pudieron subir los archivos");
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
          setSyncStatus("error");
          setSyncMessage(error instanceof Error ? error.message : "No se pudo abrir el archivo");
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
          setSyncStatus("error");
          setSyncMessage(error instanceof Error ? error.message : "No se pudo eliminar el archivo");
        }
      },
      resetData: () => setData(normalizeNexoDataForSupabase(defaultNexoData)),
    }),
    [uploadDriveFiles],
  );

  return { data, ready, syncStatus, syncMessage, ...actions };
}
