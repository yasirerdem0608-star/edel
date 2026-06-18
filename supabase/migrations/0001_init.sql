-- Edel Drive: çekirdek şema
-- Workspaces (takımlar), üyelikler, klasörler, dosyalar, paylaşım linkleri.

create extension if not exists "pgcrypto";

-- Workspaces (ekipler)
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Üyelikler
create type workspace_role as enum ('owner', 'admin', 'member');

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Klasörler (ağaç)
create table folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  parent_id uuid references folders(id) on delete cascade,
  name text not null,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index folders_workspace_parent_idx on folders(workspace_id, parent_id);

-- Dosyalar (Supabase Storage'daki nesneye işaret eder)
create table files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  folder_id uuid references folders(id) on delete cascade,
  name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint not null default 0,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index files_workspace_folder_idx on files(workspace_id, folder_id);

-- Paylaşım linkleri
create table share_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  file_id uuid references files(id) on delete cascade,
  folder_id uuid references folders(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  password_hash text,
  created_at timestamptz not null default now(),
  check ((file_id is not null) <> (folder_id is not null))
);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('drive', 'drive', false)
on conflict (id) do nothing;

-- ============ RLS ============
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table folders enable row level security;
alter table files enable row level security;
alter table share_links enable row level security;

-- Yardımcı: kullanıcı workspace üyesi mi?
create or replace function is_workspace_member(ws uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function is_workspace_admin(ws uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- workspaces
create policy "workspaces: üyeler okur" on workspaces
  for select using (is_workspace_member(id));
create policy "workspaces: herkes oluşturur" on workspaces
  for insert with check (auth.uid() = created_by);
create policy "workspaces: adminler günceller" on workspaces
  for update using (is_workspace_admin(id));

-- workspace_members
create policy "members: kendi üyeliklerini görür" on workspace_members
  for select using (user_id = auth.uid() or is_workspace_member(workspace_id));
create policy "members: adminler ekler" on workspace_members
  for insert with check (
    is_workspace_admin(workspace_id)
    or (
      -- workspace yeni oluşturuldu, kurucu kendini owner yapıyor
      user_id = auth.uid()
      and exists (select 1 from workspaces w where w.id = workspace_id and w.created_by = auth.uid())
    )
  );
create policy "members: adminler siler" on workspace_members
  for delete using (is_workspace_admin(workspace_id));

-- folders
create policy "folders: üyeler okur" on folders
  for select using (is_workspace_member(workspace_id));
create policy "folders: üyeler oluşturur" on folders
  for insert with check (is_workspace_member(workspace_id) and created_by = auth.uid());
create policy "folders: üyeler günceller" on folders
  for update using (is_workspace_member(workspace_id));
create policy "folders: üyeler siler" on folders
  for delete using (is_workspace_member(workspace_id));

-- files
create policy "files: üyeler okur" on files
  for select using (is_workspace_member(workspace_id));
create policy "files: üyeler oluşturur" on files
  for insert with check (is_workspace_member(workspace_id) and created_by = auth.uid());
create policy "files: üyeler günceller" on files
  for update using (is_workspace_member(workspace_id));
create policy "files: üyeler siler" on files
  for delete using (is_workspace_member(workspace_id));

-- share_links
create policy "shares: üyeler okur" on share_links
  for select using (is_workspace_member(workspace_id));
create policy "shares: üyeler oluşturur" on share_links
  for insert with check (is_workspace_member(workspace_id) and created_by = auth.uid());
create policy "shares: oluşturanlar siler" on share_links
  for delete using (created_by = auth.uid() or is_workspace_admin(workspace_id));

-- Storage RLS: yalnız workspace üyeleri yükler/okur.
-- Yol formatı: {workspace_id}/{file_id}/{name}
create policy "storage: üyeler okur" on storage.objects
  for select using (
    bucket_id = 'drive'
    and is_workspace_member((split_part(name, '/', 1))::uuid)
  );
create policy "storage: üyeler yazar" on storage.objects
  for insert with check (
    bucket_id = 'drive'
    and is_workspace_member((split_part(name, '/', 1))::uuid)
  );
create policy "storage: üyeler siler" on storage.objects
  for delete using (
    bucket_id = 'drive'
    and is_workspace_member((split_part(name, '/', 1))::uuid)
  );
