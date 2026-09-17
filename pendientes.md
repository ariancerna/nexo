# Pendientes de Nexo

Lista de trabajo pendiente para la siguiente fase. Cada ítem indica contexto de dónde está el código para facilitar su resolución.

## 1. Bugs de sincronización y funcionalidad

Los módulos (notas, tareas, calendario, drive, guardados, listas, spaces, focus, perfil, notificaciones) ya funcionan, pero quedan bugs reales que afectan la UI:

### 1.1 Los datos locales se descartan al iniciar sesión sin aviso

`hooks/use-nexo-data.ts:89-96`: con sesión activa, `setData(remoteData)` reemplaza lo que había en localStorage (trabajo offline/local) sin merge ni confirmación.

Fix propuesto: merge inteligente (tomar el que tenga `updatedAt` más reciente por entidad) o al menos avisar antes de reemplazar.

### 1.2 El sync puede quedarse "Sincronizando" para siempre con IDs no-UUID

`hooks/use-nexo-data.ts:154` vuelve a `"synced"` solo si `latestSnapshot.current === nextSnapshot`, pero `saveNexoDataToSupabase` devuelve el dato **normalizado** por `normalizeNexoDataForSupabase` (`lib/nexo/supabase-data.ts:149-209`), que reescribe ids no-UUID y convierte a `null` los `spaceId` que no existen (`toNullableUuid`, `supabase-data.ts:58-64`). Si entra cualquier id no-UUID (localStorage viejo, o el fallback de `createId` en `lib/nexo/default-data.ts:36-44` con navegadores sin `crypto.randomUUID`), las snapshots nunca coinciden y el estado queda colgado en "Guardando cambios".

Fix propuesto: alimentar el estado React con el dato devuelto por el guardado (`setData(savedData)` dentro del `.then`).

### 1.3 Archivos subidos sin sesión se rompen al iniciar sesión

`hooks/use-nexo-data.ts:179-181`: `uploadDriveFiles` crea un `DriveFile` local con `storagePath: null`. Al sincronizar, `supabase-data.ts:528` inventa `storage_path = ${userId}/${file.id}/${file.name}` aunque el objeto **no existe** en el bucket (columna `storage_path` es `not null`, `202609150002.sql:68`). La UI habilita "Abrir" porque `file.storagePath` ya no es null (`nexo-workspace.tsx:1810-1817`) y `createDriveFileSignedUrl` falla con error.

Fix propuesto: no inventar el `storage_path` (marcar como "sólo local" en un campo aparte) o subir el archivo pendiente en el siguiente sync; ocultar/deshabilitar "Abrir" mientras no exista en el bucket.

### 1.4 "Vaciar workspace" pierde las preferencias

`hooks/use-nexo-data.ts:230-240`: `resetData` reconstruye `settings` desde el default y conserva solo `confirmedOAuthProviders`. Se pierden `theme`, `accentColor`, `enabledModules` y `readNotificationIds`, contradiciendo la UI que dice "conserva tu cuenta y preferencias" (`nexo-workspace.tsx:2397`).

Fix: conservar `current.settings` completo y solo vaciar contenido (`spaces/notes/tasks/events/savedItems/lists/listItems/driveFiles/focusSessions`).

### 1.5 Usuarios nuevos autenticados arrancan en tema "system" (no claro)

`lib/nexo/default-data.ts:14` usa `theme: "light"`, pero la migración inserta `user_settings` por defecto con `theme: 'system'` (`supabase/migrations/202609150001_phase_2_auth_foundation.sql:28-29,107-109`). Al leer con `normalizeSettings` (`supabase-data.ts:113-115`) el `'system'` remoto pisa el default local, así que un usuario nuevo puede amanecer en oscuro según el SO.

Fix propuesto: nueva migración que cambie el default de `user_settings` a `'light'` y (opcional) corrija usuarios existentes con `theme: 'system'` recién creados que nunca lo tocaron.

### 1.6 El módulo "Espacios" desaparece de la navegación tras el primer login

Mismo origen de 1.5: el default de `user_settings.enabled_modules` de la migración (`202609150001.sql:34`) no incluye `'spaces'` (ni `'dashboard'`/`'settings'`/`'profile'`). Al sincronizar, `normalizeModuleList` (`supabase-data.ts:82-90`) reemplaza los módulos locales por los remotos y `visibleModules` (`nexo-workspace.tsx:380-386`) oculta "Espacios". En móvil el módulo queda inaccesible (el bottom nav también filtra por `enabledModules`, `nexo-workspace.tsx:1207-1211`).

Fix: incluir `'spaces'` (y dejar el resto coherente con el default del cliente, `default-data.ts:19-30`) en el default de la migración.

### 1.7 Notificaciones: tareas con vencimiento hoy se marcan como "Tarea vencida" según la zona horaria

`components/workspace/notifications-panel.tsx:20-25` compara `task.dueDate` (fecha local "YYYY-MM-DD") contra `now.toISOString().slice(0, 10)` (fecha **UTC**). En timezones al oeste de UTC, a ciertas horas del día las tareas con vencimiento hoy se muestran como vencidas (o como de ayer/hoy mal según la hora).

Fix: comparar contra la fecha local (reutilizar `todayInputValue()` de `nexo-workspace.tsx:165-167`).

### 1.8 El historial de notificaciones leídas se trunca a 200 al guardar

`supabase-data.ts:144`: `readNotificationIds.slice(-200)`. Al recargar, notificaciones antiguas ya marcadas como leídas pueden reaparecer como no leídas.

Fix: no truncar (o llevarlo a una tabla propia de notificaciones).

### 1.9 `addEvent` puede lanzar `RangeError: Invalid time value`

`nexo-workspace.tsx:547-548`: `new Date(getFormValue(...)).toISOString()` sin try/catch. Con los inputs `required` no debería llegar vacío, pero un submit manipulado rompe el componente. Envolver en validación/guard cliqueada como en los demás formularios.

## 2. Editar espacios (falta para el comportamiento prometido del seed)

`addSpace` (`nexo-workspace.tsx:511-534`) crea espacios completos (nombre, descripción, icono SVG curado, color), pero **no existe edición**: grep de `editSpace`/`updateSpace`/`renameSpace` no devuelve nada. No se puede renombrar, cambiar icono/color/descripción de un espacio existente.

Implementar:
- Una acción `editSpace` análoga a `addSpace`, reutilizando el formulario de `SpacesView` (`nexo-workspace.tsx:1927-1957`) en modo edición (pre-cargado con `defaultValue`).
- Persistencia y contadores: al editar solo cambian campos del espacio; `countSpaceItems` (`nexo-workspace.tsx:197-206`) se recalcula solo.
- Mostrar en tarjetas/sidebar (ya lo hace via `SpaceIcon`, `nexo-workspace.tsx:214-218`).

## 3. Calidad "senior" y facilidad de uso (cierre)

El producto ya se siente coherente (FeedbackDialog, aria-labels, estados vacíos, feedback de sync). Falta el pulido final:

- **Skeletons/loaders**: el único estado de carga es el texto "Cargando Nexo" (`nexo-workspace.tsx:816-824`). Agregar skeleton en el workspace y en los paneles.
- **Reintento en errores**: los errores de sync/drive solo se muestran como texto (`use-nexo-data.ts:101-105,159-164,187-190,210-213`). No hay botón para reintentar.
- **Confirmación de guardado**: no hay toast "Cambios guardados"; el único indicador es pasivo (barra de sync y "Guardado local: {fecha}"). Se puede reutilizar `StatusMessage` de `profile-view.tsx:260-273`.
- **Código muerto**: `components/layout/desktop-app-shell.tsx` y `mobile-app-shell.tsx` no se importan en ninguna parte y usan datos mock; además `desktop-app-shell.tsx:95` tiene las iniciales "AC" hardcodeadas. Eliminarlos o convertirlos en el shell real.
- **Validación del proveedor OAuth**: `providerEndpointIsReady` (`app/auth/actions.ts:34-45`) degrada a `return true` si el fetch falla (red/CORS) → falsos negativos/positivos. Evaluar redirigir directo y manejar el error en el callback (`app/auth/callback/route.ts`) en lugar de pre-validar con fetch.

## 4. Mejoras opcionales (deuda menor, no bloqueante)

- **Zona horaria**: el campo `timezone` ya se guarda en `profiles` pero no alimenta ninguna lógica (orden/mostrado de fechas del calendario, tareas, focus). Decidir su uso.
- **`createId`** (`lib/nexo/default-data.ts:36-44`) ignora su prefijo (`void _prefix`) y su fallback devuelve un id no-UUID. Unificar con `createUuid` de `supabase-data.ts:40-48` (que sí genera UUID en todos los casos).
- **`events.description` y `saved_items.updated_at`** se escriben con valores fijos al sincronizar (`supabase-data.ts:471,492`); si algún día la UI edita descripciones, se pierde el dato.
- **Tablas sin uso**: `public.folders` y `public.subtasks` están creadas con RLS pero la app nunca las escribe (`SyncTable` en `supabase-data.ts:28-38` incluye `"folders"` sin uso).

## Notas

- `README.md` describe la arquitectura, el stack y los scripts disponibles (`npm run dev`, `lint`, `typecheck`, `build`, `test:e2e`).
- No usar la service role key en el cliente; solo `NEXT_PUBLIC_SUPABASE_URL` y publishable/anon key.
