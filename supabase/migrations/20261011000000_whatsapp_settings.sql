-- Run this once against your database (WhatsApp settings, per-conversation AI control, notifications).
create table if not exists public.whatsapp_settings (
  client_id uuid primary key references public.clients(id) on delete cascade,
  ai_enabled boolean not null default false,
  ai_tone text not null default 'friendly' check (ai_tone in ('friendly','formal','concise','sales')),
  ai_language text not null default 'auto' check (ai_language in ('auto','ar','en','ar_en')),
  ai_instructions text not null default '' check (char_length(ai_instructions) <= 4000),
  ai_reply_mode text not null default 'always' check (ai_reply_mode in ('always','business_hours','outside_hours')),
  handoff_keywords text[] not null default array['موظف','بشري','agent','human']::text[],
  handoff_message text not null default 'تم تحويل محادثتك إلى أحد موظفينا وسيتواصل معك قريبًا.' check (char_length(handoff_message) <= 1000),
  max_ai_replies integer not null default 20 check (max_ai_replies between 1 and 200),
  hours_enabled boolean not null default false,
  timezone text not null default 'Asia/Aden' check (char_length(timezone) <= 64),
  business_hours jsonb not null default '{}'::jsonb,
  outside_hours_message text not null default 'شكرًا لتواصلك! نحن خارج أوقات العمل حاليًا.' check (char_length(outside_hours_message) <= 1000),
  welcome_enabled boolean not null default true,
  welcome_message text not null default 'أهلًا بك! كيف يمكننا مساعدتك اليوم؟' check (char_length(welcome_message) <= 1000),
  unavailable_message text not null default 'عذرًا، لا يمكننا الرد حاليًا.' check (char_length(unavailable_message) <= 1000),
  closing_message text not null default 'شكرًا لتواصلك معنا!' check (char_length(closing_message) <= 1000),
  ignore_groups boolean not null default true,
  read_messages boolean not null default false,
  reject_calls boolean not null default false,
  notify_new_message boolean not null default true,
  notify_disconnect boolean not null default true,
  notify_errors boolean not null default true,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.whatsapp_settings enable row level security;
grant select, insert, update on public.whatsapp_settings to authenticated;
grant all on public.whatsapp_settings to service_role;
create policy whatsapp_settings_select on public.whatsapp_settings for select to authenticated using (public.is_client_member(client_id));
create policy whatsapp_settings_insert on public.whatsapp_settings for insert to authenticated with check (public.has_client_role(client_id, array['owner','admin']::public.client_role[]));
create policy whatsapp_settings_update on public.whatsapp_settings for update to authenticated
  using (public.has_client_role(client_id, array['owner','admin']::public.client_role[]))
  with check (public.has_client_role(client_id, array['owner','admin']::public.client_role[]));

alter table public.conversations
  add column if not exists ai_paused boolean not null default false,
  add column if not exists ai_reply_count integer not null default 0,
  add column if not exists away_sent_at timestamptz;

create table if not exists public.client_notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  platform public.platform_name not null,
  kind text not null check (kind in ('new_message','disconnected','error','info')),
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists client_notifications_client_idx on public.client_notifications (client_id, created_at desc);
alter table public.client_notifications enable row level security;
grant select, update on public.client_notifications to authenticated;
grant all on public.client_notifications to service_role;
create policy client_notifications_select on public.client_notifications for select to authenticated using (public.is_client_member(client_id));
create policy client_notifications_update on public.client_notifications for update to authenticated using (public.is_client_member(client_id)) with check (public.is_client_member(client_id));
