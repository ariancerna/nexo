grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_settings to authenticated;
grant select, insert, update, delete on table public.spaces to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant select, insert, update, delete on table public.subtasks to authenticated;
grant select, insert, update, delete on table public.folders to authenticated;
grant select, insert, update, delete on table public.files to authenticated;
grant select, insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.saved_items to authenticated;
grant select, insert, update, delete on table public.lists to authenticated;
grant select, insert, update, delete on table public.list_items to authenticated;
grant select, insert, update, delete on table public.focus_sessions to authenticated;
