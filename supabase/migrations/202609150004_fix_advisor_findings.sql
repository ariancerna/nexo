create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists tasks_space_id_idx on public.tasks(space_id);
create index if not exists subtasks_user_id_idx on public.subtasks(user_id);
create index if not exists folders_space_id_idx on public.folders(space_id);
create index if not exists files_space_id_idx on public.files(space_id);
create index if not exists events_space_id_idx on public.events(space_id);
create index if not exists saved_items_space_id_idx on public.saved_items(space_id);
create index if not exists lists_space_id_idx on public.lists(space_id);
create index if not exists list_items_user_id_idx on public.list_items(user_id);
create index if not exists focus_sessions_space_id_idx on public.focus_sessions(space_id);
create index if not exists focus_sessions_task_id_idx on public.focus_sessions(task_id);
