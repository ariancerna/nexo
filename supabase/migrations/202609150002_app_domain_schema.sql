create extension if not exists "pgcrypto";

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'sparkles',
  color text not null default '#4f46e5',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  content text not null default '',
  is_favorite boolean not null default false,
  is_trashed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  is_favorite boolean not null default false,
  is_trashed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  space_id uuid references public.spaces(id) on delete set null,
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  metadata jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  is_trashed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  description text not null default '',
  location text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_valid_range check (ends_at >= starts_at)
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  url text not null,
  title text not null,
  description text not null default '',
  type text not null default 'link' check (type in ('article', 'video', 'repository', 'document', 'link', 'other')),
  preview_image text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  duration_minutes integer not null check (duration_minutes > 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists spaces_user_id_idx on public.spaces(user_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_space_id_idx on public.notes(space_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists folders_user_id_idx on public.folders(user_id);
create index if not exists folders_parent_id_idx on public.folders(parent_id);
create index if not exists files_user_id_idx on public.files(user_id);
create index if not exists files_folder_id_idx on public.files(folder_id);
create index if not exists events_user_id_starts_at_idx on public.events(user_id, starts_at);
create index if not exists saved_items_user_id_idx on public.saved_items(user_id);
create index if not exists lists_user_id_idx on public.lists(user_id);
create index if not exists list_items_list_id_position_idx on public.list_items(list_id, position);
create index if not exists focus_sessions_user_id_started_at_idx on public.focus_sessions(user_id, started_at);

drop trigger if exists spaces_set_updated_at on public.spaces;
create trigger spaces_set_updated_at
before update on public.spaces
for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists subtasks_set_updated_at on public.subtasks;
create trigger subtasks_set_updated_at
before update on public.subtasks
for each row execute function public.set_updated_at();

drop trigger if exists folders_set_updated_at on public.folders;
create trigger folders_set_updated_at
before update on public.folders
for each row execute function public.set_updated_at();

drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at
before update on public.files
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists saved_items_set_updated_at on public.saved_items;
create trigger saved_items_set_updated_at
before update on public.saved_items
for each row execute function public.set_updated_at();

drop trigger if exists lists_set_updated_at on public.lists;
create trigger lists_set_updated_at
before update on public.lists
for each row execute function public.set_updated_at();

drop trigger if exists list_items_set_updated_at on public.list_items;
create trigger list_items_set_updated_at
before update on public.list_items
for each row execute function public.set_updated_at();

alter table public.spaces enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.events enable row level security;
alter table public.saved_items enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.focus_sessions enable row level security;

drop policy if exists "Users can read own spaces" on public.spaces;
create policy "Users can read own spaces" on public.spaces
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own spaces" on public.spaces;
create policy "Users can insert own spaces" on public.spaces
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own spaces" on public.spaces;
create policy "Users can update own spaces" on public.spaces
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own spaces" on public.spaces;
create policy "Users can delete own spaces" on public.spaces
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own notes" on public.notes;
create policy "Users can read own notes" on public.notes
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own notes" on public.notes;
create policy "Users can insert own notes" on public.notes
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own notes" on public.notes;
create policy "Users can update own notes" on public.notes
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own notes" on public.notes;
create policy "Users can delete own notes" on public.notes
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own tasks" on public.tasks;
create policy "Users can read own tasks" on public.tasks
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks" on public.tasks
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks" on public.tasks
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks" on public.tasks
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own subtasks" on public.subtasks;
create policy "Users can read own subtasks" on public.subtasks
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own subtasks" on public.subtasks;
create policy "Users can insert own subtasks" on public.subtasks
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own subtasks" on public.subtasks;
create policy "Users can update own subtasks" on public.subtasks
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own subtasks" on public.subtasks;
create policy "Users can delete own subtasks" on public.subtasks
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own folders" on public.folders;
create policy "Users can read own folders" on public.folders
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own folders" on public.folders;
create policy "Users can insert own folders" on public.folders
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own folders" on public.folders;
create policy "Users can update own folders" on public.folders
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own folders" on public.folders;
create policy "Users can delete own folders" on public.folders
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own files" on public.files;
create policy "Users can read own files" on public.files
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own files" on public.files;
create policy "Users can insert own files" on public.files
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own files" on public.files;
create policy "Users can update own files" on public.files
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own files" on public.files;
create policy "Users can delete own files" on public.files
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own events" on public.events;
create policy "Users can read own events" on public.events
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own events" on public.events;
create policy "Users can insert own events" on public.events
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own events" on public.events;
create policy "Users can update own events" on public.events
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own events" on public.events;
create policy "Users can delete own events" on public.events
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own saved items" on public.saved_items;
create policy "Users can read own saved items" on public.saved_items
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own saved items" on public.saved_items;
create policy "Users can insert own saved items" on public.saved_items
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own saved items" on public.saved_items;
create policy "Users can update own saved items" on public.saved_items
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own saved items" on public.saved_items;
create policy "Users can delete own saved items" on public.saved_items
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own lists" on public.lists;
create policy "Users can read own lists" on public.lists
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own lists" on public.lists;
create policy "Users can insert own lists" on public.lists
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own lists" on public.lists;
create policy "Users can update own lists" on public.lists
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own lists" on public.lists;
create policy "Users can delete own lists" on public.lists
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own list items" on public.list_items;
create policy "Users can read own list items" on public.list_items
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own list items" on public.list_items;
create policy "Users can insert own list items" on public.list_items
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own list items" on public.list_items;
create policy "Users can update own list items" on public.list_items
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own list items" on public.list_items;
create policy "Users can delete own list items" on public.list_items
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own focus sessions" on public.focus_sessions;
create policy "Users can read own focus sessions" on public.focus_sessions
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own focus sessions" on public.focus_sessions;
create policy "Users can insert own focus sessions" on public.focus_sessions
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own focus sessions" on public.focus_sessions;
create policy "Users can update own focus sessions" on public.focus_sessions
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own focus sessions" on public.focus_sessions;
create policy "Users can delete own focus sessions" on public.focus_sessions
for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('nexo-files', 'nexo-files', false, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Users can read own storage objects" on storage.objects;
create policy "Users can read own storage objects" on storage.objects
for select to authenticated
using (
  bucket_id = 'nexo-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can insert own storage objects" on storage.objects;
create policy "Users can insert own storage objects" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'nexo-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can update own storage objects" on storage.objects;
create policy "Users can update own storage objects" on storage.objects
for update to authenticated
using (
  bucket_id = 'nexo-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'nexo-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete own storage objects" on storage.objects;
create policy "Users can delete own storage objects" on storage.objects
for delete to authenticated
using (
  bucket_id = 'nexo-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
