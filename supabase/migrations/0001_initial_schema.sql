-- Jarvis initial schema (Version 1)
-- Every table is user-scoped and protected by Row Level Security.

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Chats & messages
-- ---------------------------------------------------------------------------
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Ny samtale',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chats_user_id_updated_at_idx on public.chats (user_id, updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  action jsonb, -- structured JSON action proposed by the assistant, if any
  created_at timestamptz not null default now()
);

create index messages_chat_id_created_at_idx on public.messages (chat_id, created_at);

-- ---------------------------------------------------------------------------
-- Long-term memory
-- ---------------------------------------------------------------------------
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (
    category in ('identity', 'preference', 'project', 'workflow', 'favorite', 'fact')
  ),
  key text not null,
  value text not null,
  importance smallint not null default 3 check (importance between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, key)
);

-- ---------------------------------------------------------------------------
-- Tasks & calendar (V2 features, schema prepared now)
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Skills & plugins
-- ---------------------------------------------------------------------------
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.plugins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------------------------------------------------------------------------
-- Settings, API keys, voice settings
-- ---------------------------------------------------------------------------
create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  language text not null default 'da',
  developer_mode boolean not null default false,
  actions_enabled boolean not null default true, -- global kill switch for device actions
  updated_at timestamptz not null default now()
);

-- Keys are encrypted server-side (AES-256-GCM) before insert; the ciphertext
-- is never returned to the browser, only key metadata.
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('anthropic', 'openai', 'elevenlabs', 'gemini')),
  encrypted_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table public.voice_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  wake_word text not null default 'jarvis',
  stt_enabled boolean not null default true,
  tts_enabled boolean not null default true,
  elevenlabs_voice_id text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Devices & activity logs
-- ---------------------------------------------------------------------------
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text not null default 'windows' check (platform in ('windows', 'mac', 'linux')),
  status text not null default 'offline' check (status in ('online', 'offline')),
  agent_version text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id uuid references public.devices (id) on delete set null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'dispatched', 'success', 'error', 'rejected')),
  output text,
  error text,
  created_at timestamptz not null default now()
);

create index activity_logs_user_id_created_at_idx
  on public.activity_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: users can only touch their own rows
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.skills enable row level security;
alter table public.plugins enable row level security;
alter table public.settings enable row level security;
alter table public.api_keys enable row level security;
alter table public.voice_settings enable row level security;
alter table public.devices enable row level security;
alter table public.activity_logs enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own chats" on public.chats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own memories" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own calendar_events" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own skills" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own plugins" on public.plugins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- API keys: ciphertext must never reach the browser. Only insert/delete from
-- the client; reads happen with the service-role key on the server.
create policy "insert own api_keys" on public.api_keys
  for insert with check (auth.uid() = user_id);
create policy "delete own api_keys" on public.api_keys
  for delete using (auth.uid() = user_id);

create policy "own voice_settings" on public.voice_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own devices" on public.devices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own activity_logs" on public.activity_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Bootstrap profile + settings on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  insert into public.settings (user_id) values (new.id);
  insert into public.voice_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
