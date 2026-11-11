-- ============================================================
-- H-Rua!! リンク公開／非公開設定
-- Supabase SQL Editorで1回実行してください。
-- ============================================================

create table if not exists public.site_link_settings (
  link_key text primary key check (char_length(trim(link_key)) between 1 and 40),
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_link_settings enable row level security;

drop policy if exists "Public can read link visibility" on public.site_link_settings;
create policy "Public can read link visibility"
  on public.site_link_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage link visibility" on public.site_link_settings;
create policy "Admins can manage link visibility"
  on public.site_link_settings for all
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

grant select on public.site_link_settings to anon, authenticated;
grant insert, update, delete on public.site_link_settings to authenticated;

-- 初期状態はすべて公開。既存の値は上書きしません。
insert into public.site_link_settings (link_key, is_public)
values
  ('youtube', true), ('instagram', true), ('x', true),
  ('threads', true), ('bereal', true), ('jiffcy', true),
  ('twitch', true), ('steam', true), ('gamee', true), ('discord', true)
on conflict (link_key) do nothing;

select 'Link visibility settings are ready.' as result;
