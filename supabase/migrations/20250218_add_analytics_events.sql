create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  ap_name text not null,
  refer text not null,
  action_type text,
  user_id text not null,
  device_id text not null,
  platform text not null,
  version text not null,
  items jsonb not null default '[]'::jsonb,
  extra jsonb,
  time timestamptz not null default now(),
  inserted_at timestamptz not null default now()
);

create index if not exists analytics_events_ap_time_idx
  on public.analytics_events (ap_name, time desc);

create index if not exists analytics_events_user_idx
  on public.analytics_events (user_id);

create index if not exists analytics_events_device_idx
  on public.analytics_events (device_id);
