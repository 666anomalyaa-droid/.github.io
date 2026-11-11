/* =====================================================================
   Supabase データベース初期設定SQL

   1) Supabase Dashboard の SQL Editor を開く
   2) このファイル全体を貼り付けて実行する
   3) README.md の手順に従って管理者アカウントを登録する

   このSQLは次の3つを用意します。
   - announcements      : 管理者のお知らせ
   - visitor_comments   : 訪問者コメント（投稿直後は承認待ち）
   - site_admins        : 管理者のユーザーID

   Row Level Security (RLS) により、公開側は公開済みデータのみ見え、
   管理操作は site_admins に登録したログインユーザーだけに許可します。
   ===================================================================== */

-- UUIDを自動生成する拡張機能
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 管理者一覧：Supabase AuthのユーザーIDを登録して管理者を指定
-- ------------------------------------------------------------
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_admins enable row level security;
-- site_adminsには一般ユーザー向けのポリシーを作りません。
-- 管理者判定関数だけがこのテーブルを参照します。

-- RLS内で管理者かどうかを安全に判定する関数
create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.site_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

-- ------------------------------------------------------------
-- お知らせテーブル
-- ------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 100),
  content text not null check (char_length(trim(content)) between 1 and 3000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- 公開側：公開済みのお知らせだけ読める
 drop policy if exists "Public can read published announcements" on public.announcements;
create policy "Public can read published announcements"
  on public.announcements for select
  to anon, authenticated
  using (is_published = true);

-- 管理者：全お知らせの閲覧・追加・編集・削除ができる
 drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements"
  on public.announcements for all
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

-- テーブル権限はRLSと併用する（権限だけではデータ操作できません）
grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

-- ------------------------------------------------------------
-- 訪問者コメントテーブル
-- ------------------------------------------------------------
create table if not exists public.visitor_comments (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 30),
  content text not null check (char_length(trim(content)) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

alter table public.visitor_comments enable row level security;

-- 公開側：承認済みコメントだけ読める
 drop policy if exists "Public can read approved comments" on public.visitor_comments;
create policy "Public can read approved comments"
  on public.visitor_comments for select
  to anon, authenticated
  using (status = 'approved');

-- 公開側：コメントの新規投稿だけ許可。必ずpendingで登録する。
 drop policy if exists "Visitors can submit pending comments" on public.visitor_comments;
create policy "Visitors can submit pending comments"
  on public.visitor_comments for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and char_length(trim(display_name)) between 1 and 30
    and char_length(trim(content)) between 1 and 500
  );

-- 管理者：すべてのコメントの閲覧・承認・削除ができる
 drop policy if exists "Admins can manage visitor comments" on public.visitor_comments;
create policy "Admins can manage visitor comments"
  on public.visitor_comments for all
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

-- 一般ユーザーには名前と本文だけ挿入させる。
-- status / created_at / id を勝手に指定できないよう列単位で権限を制限。
revoke insert on public.visitor_comments from anon, authenticated;
grant insert (display_name, content) on public.visitor_comments to anon, authenticated;
grant select on public.visitor_comments to anon, authenticated;
grant update, delete on public.visitor_comments to authenticated;

-- 一覧の表示順を速くするためのインデックス
create index if not exists announcements_published_created_idx
  on public.announcements (is_published, created_at desc);
create index if not exists visitor_comments_status_created_idx
  on public.visitor_comments (status, created_at desc);

-- 完了メッセージ（SQL Editorの結果欄で確認できます）
select 'Setup completed. Next: create a Supabase Auth user and register it in public.site_admins.' as result;


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
