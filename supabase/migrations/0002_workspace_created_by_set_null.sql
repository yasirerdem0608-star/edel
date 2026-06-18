-- Veri kaybı koruması: workspaces.created_by FK'si ON DELETE CASCADE idi.
-- Ortak "Edel" deposunu ilk giren kullanıcı oluşturur (created_by = o kullanıcı).
-- O kullanıcı Supabase'den silinirse TÜM workspace + klasör + dosyalar cascade ile
-- silinirdi. created_by'ı nullable + ON DELETE SET NULL yapıp bu riski kaldırıyoruz.

alter table workspaces alter column created_by drop not null;
alter table workspaces drop constraint workspaces_created_by_fkey;
alter table workspaces add constraint workspaces_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;
