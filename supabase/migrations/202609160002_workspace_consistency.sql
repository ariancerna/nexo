alter table public.user_settings
alter column preferences set default jsonb_build_object(
  'theme', 'light',
  'accent_color', 'indigo',
  'interface_density', 'comfortable',
  'animations', true,
  'shadow_intensity', 'medium',
  'enabled_modules', jsonb_build_array(
    'dashboard', 'notes', 'drive', 'tasks', 'calendar', 'spaces',
    'saved', 'lists', 'focus', 'profile', 'settings'
  ),
  'read_notification_ids', jsonb_build_array(),
  'confirmed_oauth_providers', jsonb_build_array()
);

-- Only migrate untouched rows created with the original defaults. Rows changed by
-- a user keep their explicit theme and module selection.
update public.user_settings
set preferences = preferences
  || jsonb_build_object(
    'theme', 'light',
    'enabled_modules', jsonb_build_array(
      'dashboard', 'notes', 'drive', 'tasks', 'calendar', 'spaces',
      'saved', 'lists', 'focus', 'profile', 'settings'
    )
  )
where updated_at = created_at
  and preferences ->> 'theme' = 'system'
  and preferences -> 'enabled_modules' = jsonb_build_array(
    'notes', 'drive', 'tasks', 'calendar', 'saved', 'lists', 'focus'
  );

-- These structures never had an application workflow. Removing them also keeps
-- the generated API surface aligned with the entities Nexo actually supports.
alter table public.files drop column if exists folder_id;
drop table if exists public.folders;
drop table if exists public.subtasks;
