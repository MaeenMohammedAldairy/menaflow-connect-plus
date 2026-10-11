-- ============================================================
-- MenaFlow core schema
-- clients / users / roles & permissions / channel connections /
-- conversations / messages / knowledge sources / products /
-- images / inventory / orders / contacts / webhook events.
-- Every tenant table carries client_id and is isolated by RLS.
-- ============================================================

-- ---------- enums ----------
create type public.app_role as enum ('admin','staff','user');
create type public.client_role as enum ('owner','admin','agent','viewer');
create type public.platform_name as enum ('whatsapp','facebook','instagram');
create type public.connection_status as enum ('pending','connected','disconnected','error');
create type public.member_status as enum ('invited','active','suspended');
create type public.message_direction as enum ('inbound','outbound');
create type public.message_status as enum ('queued','sent','delivered','read','failed');
create type public.order_status as enum ('pending','confirmed','preparing','shipped','delivered','cancelled');
create type public.payment_status as enum ('unpaid','paid','refunded');
create type public.review_status as enum ('draft','approved','rejected');
create type public.webhook_status as enum ('received','processed','failed','ignored');

-- ---------- identity ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  phone text,
  locale text not null default 'ar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null default '',
  notifications boolean not null default true,
  auto_publish boolean not null default false,
  locale text not null default 'ar',
  timezone text not null default 'Asia/Aden',
  updated_at timestamptz not null default now()
);

-- ---------- clients (tenants) ----------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  logo_url text,
  phone text,
  email text,
  website text,
  country text not null default 'YE',
  currency text not null default 'SAR',
  timezone text not null default 'Asia/Aden',
  locale text not null default 'ar',
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.client_role not null default 'agent',
  permissions jsonb not null default '[]'::jsonb,
  status public.member_status not null default 'active',
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, user_id)
);

create table public.role_permissions (
  role public.client_role not null,
  permission text not null,
  primary key (role, permission)
);

-- ---------- channel connections ----------
create table public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform public.platform_name not null,
  account_name text not null default '',
  provider_account_id text not null default '',
  status public.connection_status not null default 'pending',
  error text,
  qr_code text,
  qr_expires_at timestamptz,
  instance_name text,
  phone_number text,
  page_id text,
  token_ref text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, platform)
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  platform public.platform_name,
  event_type text not null,
  external_id text,
  payload jsonb not null default '{}'::jsonb,
  status public.webhook_status not null default 'received',
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (platform, event_type, external_id)
);

-- ---------- contacts (end customers) ----------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text,
  phone text,
  email text,
  platform public.platform_name,
  external_id text,
  avatar_url text,
  tags text[] not null default '{}',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, platform, external_id)
);

-- ---------- conversations & messages ----------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  platform public.platform_name not null,
  external_thread_id text,
  subject text,
  status text not null default 'open',
  assigned_to uuid references public.profiles(id) on delete set null,
  unread_count integer not null default 0,
  last_message_at timestamptz,
  last_message_preview text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, platform, external_thread_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction public.message_direction not null,
  platform public.platform_name not null,
  external_message_id text,
  sender_type text not null default 'customer',
  sender_id uuid references public.profiles(id) on delete set null,
  content_type text not null default 'text',
  body text,
  media_url text,
  media_mime text,
  payload jsonb not null default '{}'::jsonb,
  status public.message_status not null default 'queued',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (client_id, platform, external_message_id)
);

-- ---------- knowledge ----------
create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  source_type text not null default 'text',
  status text not null default 'active',
  content text,
  url text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  source_id uuid not null references public.knowledge_sources(id) on delete cascade,
  content text not null,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- catalog ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  slug text,
  description text,
  category text,
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  currency text not null default 'SAR',
  sku text,
  barcode text,
  status text not null default 'active',
  is_featured boolean not null default false,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, sku)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  position integer not null default 0,
  is_primary boolean not null default false,
  storage_path text,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  location text not null default 'default',
  quantity integer not null default 0,
  reserved integer not null default 0,
  reorder_point integer not null default 0,
  unit_cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, location)
);

-- ---------- orders ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  order_number text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  payment_method text,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'SAR',
  shipping_address text,
  notes text,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, order_number)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- content review ----------
create table public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  price numeric(12,2) not null default 0,
  category text not null default 'محتوى عام',
  currency text not null default 'SAR',
  platforms text[] not null default '{}',
  status public.review_status not null default 'draft',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- grants (every public table) ----------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_members TO authenticated;
GRANT ALL ON public.client_members TO service_role;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_connections TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_chunks TO authenticated;
GRANT ALL ON public.knowledge_chunks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_reviews TO authenticated;
GRANT ALL ON public.content_reviews TO service_role;

-- ---------- isolation helpers (security definer: no recursive RLS) ----------
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  );
$$;

create or replace function public.is_client_member(p_client_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.client_members m
    where m.client_id = p_client_id and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.has_client_role(p_client_id uuid, p_roles public.client_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.client_members m
    where m.client_id = p_client_id and m.user_id = auth.uid()
      and m.status = 'active' and m.role = any (p_roles)
  );
$$;

create or replace function public.shares_client_with(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.client_members a
    join public.client_members b on a.client_id = b.client_id
    where a.user_id = auth.uid() and b.user_id = p_user_id
      and a.status = 'active' and b.status = 'active'
  );
$$;

-- ---------- enable RLS ----------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_settings enable row level security;
alter table public.clients enable row level security;
alter table public.client_members enable row level security;
alter table public.role_permissions enable row level security;
alter table public.platform_connections enable row level security;
alter table public.webhook_events enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.content_reviews enable row level security;

-- ---------- identity policies ----------
create policy "profiles self or admin or teammate select" on public.profiles
  for select to authenticated using (
    id = auth.uid() or public.is_platform_admin() or public.shares_client_with(id)
  );
create policy "profiles insert self" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles update self or admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_platform_admin())
  with check (id = auth.uid() or public.is_platform_admin());

create policy "user_roles own select" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_platform_admin());
create policy "user_roles admin write" on public.user_roles
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "user_settings own select" on public.user_settings
  for select to authenticated using (user_id = auth.uid());
create policy "user_settings own insert" on public.user_settings
  for insert to authenticated with check (user_id = auth.uid());
create policy "user_settings own update" on public.user_settings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user_settings own delete" on public.user_settings
  for delete to authenticated using (user_id = auth.uid());

-- ---------- tenant policies ----------
create policy "clients member select" on public.clients
  for select to authenticated using (public.is_client_member(id) or public.is_platform_admin());
create policy "clients create" on public.clients
  for insert to authenticated with check (created_by = auth.uid() or public.is_platform_admin());
create policy "clients owner or admin update" on public.clients
  for update to authenticated
  using (public.has_client_role(id, array['owner','admin']::public.client_role[]) or public.is_platform_admin())
  with check (public.has_client_role(id, array['owner','admin']::public.client_role[]) or public.is_platform_admin());
create policy "clients owner or admin delete" on public.clients
  for delete to authenticated
  using (public.has_client_role(id, array['owner']::public.client_role[]) or public.is_platform_admin());

create policy "members visible to members" on public.client_members
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "members owner or admin manage" on public.client_members
  for insert to authenticated
  with check (public.has_client_role(client_id, array['owner','admin']::public.client_role[]) or public.is_platform_admin());
create policy "members owner or admin update" on public.client_members
  for update to authenticated
  using (public.has_client_role(client_id, array['owner','admin']::public.client_role[]) or public.is_platform_admin())
  with check (public.has_client_role(client_id, array['owner','admin']::public.client_role[]) or public.is_platform_admin());
create policy "members owner or admin delete" on public.client_members
  for delete to authenticated
  using (public.has_client_role(client_id, array['owner','admin']::public.client_role[]) or public.is_platform_admin());

create policy "role permissions readable" on public.role_permissions
  for select to authenticated using (true);

-- ---------- channel policies ----------
create policy "connections member select" on public.platform_connections
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "connections member insert" on public.platform_connections
  for insert to authenticated with check (public.is_client_member(client_id) and user_id = auth.uid());
create policy "connections member update" on public.platform_connections
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "connections member delete" on public.platform_connections
  for delete to authenticated using (public.is_client_member(client_id));

create policy "webhook events member select" on public.webhook_events
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());

-- ---------- tenant data policies ----------
create policy "contacts member select" on public.contacts
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "contacts member insert" on public.contacts
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "contacts member update" on public.contacts
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "contacts member delete" on public.contacts
  for delete to authenticated using (public.is_client_member(client_id));

create policy "conversations member select" on public.conversations
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "conversations member insert" on public.conversations
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "conversations member update" on public.conversations
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "conversations member delete" on public.conversations
  for delete to authenticated using (public.is_client_member(client_id));

create policy "messages member select" on public.messages
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "messages member insert" on public.messages
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "messages member update" on public.messages
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "messages member delete" on public.messages
  for delete to authenticated using (public.is_client_member(client_id));

create policy "knowledge member select" on public.knowledge_sources
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "knowledge member insert" on public.knowledge_sources
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "knowledge member update" on public.knowledge_sources
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "knowledge member delete" on public.knowledge_sources
  for delete to authenticated using (public.is_client_member(client_id));

create policy "chunks member select" on public.knowledge_chunks
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "chunks member insert" on public.knowledge_chunks
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "chunks member update" on public.knowledge_chunks
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "chunks member delete" on public.knowledge_chunks
  for delete to authenticated using (public.is_client_member(client_id));

create policy "products member select" on public.products
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "products member insert" on public.products
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "products member update" on public.products
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "products member delete" on public.products
  for delete to authenticated using (public.is_client_member(client_id));

create policy "images member select" on public.product_images
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "images member insert" on public.product_images
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "images member update" on public.product_images
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "images member delete" on public.product_images
  for delete to authenticated using (public.is_client_member(client_id));

create policy "inventory member select" on public.inventory
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "inventory member insert" on public.inventory
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "inventory member update" on public.inventory
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "inventory member delete" on public.inventory
  for delete to authenticated using (public.is_client_member(client_id));

create policy "orders member select" on public.orders
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "orders member insert" on public.orders
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "orders member update" on public.orders
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "orders member delete" on public.orders
  for delete to authenticated using (public.is_client_member(client_id));

create policy "order items member select" on public.order_items
  for select to authenticated using (public.is_client_member(client_id) or public.is_platform_admin());
create policy "order items member insert" on public.order_items
  for insert to authenticated with check (public.is_client_member(client_id));
create policy "order items member update" on public.order_items
  for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
create policy "order items member delete" on public.order_items
  for delete to authenticated using (public.is_client_member(client_id));

create policy "reviews own or member select" on public.content_reviews
  for select to authenticated using (user_id = auth.uid() or public.is_client_member(client_id) or public.is_platform_admin());
create policy "reviews own insert" on public.content_reviews
  for insert to authenticated with check (user_id = auth.uid() and (client_id is null or public.is_client_member(client_id)));
create policy "reviews own or member update" on public.content_reviews
  for update to authenticated
  using (user_id = auth.uid() or public.is_client_member(client_id) or public.is_platform_admin())
  with check (user_id = auth.uid() or public.is_client_member(client_id) or public.is_platform_admin());
create policy "reviews own or member delete" on public.content_reviews
  for delete to authenticated
  using (user_id = auth.uid() or public.is_client_member(client_id) or public.is_platform_admin());

-- ---------- triggers ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.user_settings;
create trigger set_updated_at before update on public.user_settings for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.clients;
create trigger set_updated_at before update on public.clients for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.client_members;
create trigger set_updated_at before update on public.client_members for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.platform_connections;
create trigger set_updated_at before update on public.platform_connections for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.contacts;
create trigger set_updated_at before update on public.contacts for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.conversations;
create trigger set_updated_at before update on public.conversations for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.knowledge_sources;
create trigger set_updated_at before update on public.knowledge_sources for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.inventory;
create trigger set_updated_at before update on public.inventory for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders for each row execute function public.touch_updated_at();
drop trigger if exists set_updated_at on public.content_reviews;
create trigger set_updated_at before update on public.content_reviews for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(coalesce(new.email,''), '@', 1), '')
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_new_client()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.client_members (client_id, user_id, role, status, joined_at)
    values (new.id, new.created_by, 'owner', 'active', now())
    on conflict (client_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_client_created on public.clients;
create trigger on_client_created after insert on public.clients
  for each row execute function public.handle_new_client();

-- ---------- permission catalog ----------
insert into public.role_permissions (role, permission) values
  ('owner','clients.manage'),
  ('owner','members.manage'),
  ('owner','connections.manage'),
  ('owner','conversations.view'),
  ('owner','conversations.reply'),
  ('owner','knowledge.manage'),
  ('owner','products.manage'),
  ('owner','inventory.manage'),
  ('owner','orders.manage'),
  ('owner','content.review'),
  ('owner','content.publish'),
  ('owner','settings.manage'),
  ('owner','reports.view'),
  ('admin','members.manage'),
  ('admin','connections.manage'),
  ('admin','conversations.view'),
  ('admin','conversations.reply'),
  ('admin','knowledge.manage'),
  ('admin','products.manage'),
  ('admin','inventory.manage'),
  ('admin','orders.manage'),
  ('admin','content.review'),
  ('admin','content.publish'),
  ('admin','settings.manage'),
  ('admin','reports.view'),
  ('agent','connections.view'),
  ('agent','conversations.view'),
  ('agent','conversations.reply'),
  ('agent','knowledge.view'),
  ('agent','products.view'),
  ('agent','orders.view'),
  ('agent','reports.view'),
  ('viewer','conversations.view'),
  ('viewer','products.view'),
  ('viewer','orders.view'),
  ('viewer','reports.view');

-- ---------- indexes ----------
create index client_members_user_idx on public.client_members (user_id, status);
create index platform_connections_client_idx on public.platform_connections (client_id, platform);
create index contacts_client_phone_idx on public.contacts (client_id, phone);
create index conversations_client_recent_idx on public.conversations (client_id, last_message_at desc nulls last);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_client_idx on public.messages (client_id, created_at desc);
create index knowledge_chunks_source_idx on public.knowledge_chunks (source_id, position);
create index products_client_idx on public.products (client_id, status);
create index product_images_product_idx on public.product_images (product_id, position);
create index inventory_client_idx on public.inventory (client_id, product_id);
create index orders_client_idx on public.orders (client_id, placed_at desc nulls last);
create index order_items_order_idx on public.order_items (order_id);
create index content_reviews_user_idx on public.content_reviews (user_id, updated_at desc);
create index webhook_events_client_idx on public.webhook_events (client_id, received_at desc);

-- ---------- realtime ----------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;