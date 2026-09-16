alter table public.profiles
add column if not exists username_changed_at timestamptz;

do $$
begin
  alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9][a-z0-9-]{2,19}$');
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.enforce_profile_username_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.username is distinct from old.username then
    if old.username_changed_at is not null
      and old.username_changed_at > now() - interval '30 days' then
      raise exception 'username_change_cooldown'
        using errcode = 'P0001';
    end if;

    new.username_changed_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_enforce_username_change on public.profiles;
create trigger profiles_enforce_username_change
before update of username on public.profiles
for each row execute function public.enforce_profile_username_change();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nexo-avatars',
  'nexo-avatars',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own avatar" on storage.objects;
create policy "Users can read own avatar" on storage.objects
for select to authenticated
using (
  bucket_id = 'nexo-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can insert own avatar" on storage.objects;
create policy "Users can insert own avatar" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'nexo-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar" on storage.objects
for update to authenticated
using (
  bucket_id = 'nexo-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'nexo-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar" on storage.objects
for delete to authenticated
using (
  bucket_id = 'nexo-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
