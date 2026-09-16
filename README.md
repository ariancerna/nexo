# Nexo

Nexo is a responsive personal hub PWA for notes, files, tasks, calendar events, spaces, saved links, lists, focus sessions, and visual preferences.

The application uses Supabase Auth, PostgreSQL with row-level security, and private Storage for cloud-backed user data. A local browser copy keeps the workspace usable while the network is unavailable and syncs again when the connection returns.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and Storage
- Local UI primitives and Lucide icons
- PWA manifest, service worker, and offline fallback

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

- `/` is the public product page.
- `/dashboard` is the authenticated personal workspace.

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Google and Microsoft OAuth credentials belong in the provider configuration of the authentication dashboard, never in a public browser environment variable.

To let users reject and undo an automatically linked Google identity, enable **Authentication > Sign In / Providers > Allow manual linking** in Supabase. Supabase requires this setting for `unlinkIdentity()`.

## Security Model

- Only the public project URL and publishable key are exposed to the browser.
- A service-role key is not used by the application and must never be prefixed with `NEXT_PUBLIC_`.
- Row-level security limits every data table and Storage object to its authenticated owner.
- Session cookies and token refresh are handled by `@supabase/ssr`.
- User-provided external links accept only `http` and `https` protocols.
- Security response headers prevent framing, MIME sniffing, and unnecessary browser permissions.

Public keys are intentionally not obfuscated. Access control is enforced by authentication and row-level security rather than hiding client configuration.

## Available Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## Current Functionality

- Password, Google, and Microsoft-ready authentication flows with onboarding, password recovery, and existing-account linking consent.
- Cloud-synced CRUD for notes, tasks, spaces, events, saved links, lists, and private files.
- Focus timer with pause, resume, reset, and completed-session history.
- Global search across workspace data.
- Light, dark, and system themes with configurable accent colors and enabled modules.
- Responsive workspace, installable PWA metadata, and an offline fallback.

Microsoft sign-in requires an Azure/Entra application to be connected and enabled in the authentication provider settings. Until that external configuration exists, Nexo returns a controlled availability message instead of a raw provider error.

## Project Structure

- `app/`: routes, authentication actions, metadata, and PWA entry points.
- `components/workspace/`: the functional Nexo workspace.
- `components/auth/`: reusable authentication UI.
- `components/ui/`: local accessible UI primitives.
- `hooks/`: local persistence and cloud synchronization.
- `lib/nexo/`: workspace seed data and persistence helpers.
- `lib/supabase/`: browser and server Supabase clients.
- `supabase/migrations/`: database, RLS, grants, and Storage policies.
- `types/`: shared TypeScript models.
