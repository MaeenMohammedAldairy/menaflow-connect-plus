create table public.connection_secrets (
  connection_id uuid primary key references public.platform_connections(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  access_token text,
  webhook_token text,
  updated_at timestamptz not null default now()
);
alter table public.connection_secrets enable row level security;
revoke all on public.connection_secrets from anon, authenticated;
grant all on public.connection_secrets to service_role;

create table public.oauth_states (
  state text primary key,
  user_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  platform public.platform_name not null,
  redirect_uri text not null,
  return_origin text not null,
  created_at timestamptz not null default now()
);
alter table public.oauth_states enable row level security;
revoke all on public.oauth_states from anon, authenticated;
grant all on public.oauth_states to service_role;

create index platform_connections_instance_idx on public.platform_connections(instance_name);
create index platform_connections_page_idx on public.platform_connections(page_id);
create index platform_connections_provider_idx on public.platform_connections(platform, provider_account_id);