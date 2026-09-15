# Nexo

Nexo is a personal digital hub built as a PWA. It organizes notes, files, tasks, calendar events, spaces, saved links, lists, focus sessions, profile-ready settings, and app preferences from one responsive workspace.

The current version is functional without backend credentials: data is persisted locally in the browser so the app can be used immediately. Supabase clients are already prepared for the next phase: cloud auth, database tables, RLS, and storage.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase
- shadcn/ui-style local primitives
- Lucide Icons
- PWA manifest, service worker, and offline page

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose a Supabase service role key in the browser.

## Available Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Current Functionality

- Responsive desktop sidebar and mobile bottom navigation.
- Local CRUD for notes, tasks, spaces, calendar events, saved links, lists, and file metadata.
- Focus timer with pause, resume, reset, and completed session history.
- Global search across local workspace data.
- Light, dark, and system theme preference.
- Configurable accent color and enabled modules.
- PWA install metadata, app shell cache, and offline fallback page.

## Project Structure

- `app/`: App Router routes, metadata, layout, and manifest.
- `components/workspace/`: functional Nexo workspace.
- `components/layout/`: application shell entry point.
- `components/providers/`: theme and accent providers.
- `components/ui/`: Nexo-styled reusable UI primitives.
- `hooks/`: local persistent workspace state.
- `lib/nexo/`: seed data and helpers.
- `lib/supabase/`: browser and server Supabase clients.
- `types/`: shared TypeScript models.
- `public/`: service worker, offline page, and icon.

## Supabase Roadmap

The next phase should replace local persistence with Supabase Auth, PostgreSQL tables, RLS policies, and Storage while preserving the current UI and local domain model.
