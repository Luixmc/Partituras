-- ============================================================
-- 006 · Storage buckets + Google Drive sync log
-- ============================================================

-- ── Supabase Storage buckets ─────────────────────────────────
-- NOTE: buckets are created via the Supabase dashboard or CLI,
-- but we document them here for reference and add storage policies.

-- Bucket: "sheets"
--   Purpose : stores PDF files and thumbnail previews
--   Path pattern for PDFs      : sheets/{sheet_id}/{filename}.pdf
--   Path pattern for thumbnails: sheets/{sheet_id}/thumb.jpg
--   Public access : false (signed URLs only)

-- Run this in the Supabase dashboard → Storage → New bucket:
--   Name: sheets | Public: OFF | File size limit: 20 MB
--   Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp

-- Storage RLS policies (applied via SQL after bucket creation)
-- Insert: authenticated users with role musician or admin
-- Select: authenticated users (signed URL issued server-side)
-- Delete: admin only

-- ── Google Drive sync log ────────────────────────────────────
create table public.drive_sync_log (
  id              uuid primary key default uuid_generate_v4(),
  sheet_id        uuid not null references public.sheets(id) on delete cascade,
  drive_file_id   text,
  drive_folder_id text,
  action          text not null,          -- 'upload' | 'update' | 'delete'
  status          text not null,          -- 'pending' | 'success' | 'failed'
  error_message   text,
  synced_at       timestamptz,
  created_at      timestamptz not null default now()
);

comment on table public.drive_sync_log is
  'Audit log for every Google Drive sync operation';

create index idx_drive_sync_sheet  on public.drive_sync_log(sheet_id);
create index idx_drive_sync_status on public.drive_sync_log(status);

alter table public.drive_sync_log enable row level security;

-- Only admins can read the sync log
create policy "drive_sync_log_admin"
  on public.drive_sync_log for all
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── Drive folder map ─────────────────────────────────────────
-- Maps each category to its Google Drive folder ID
create table public.drive_folders (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid unique references public.categories(id) on delete cascade,
  drive_folder_id text not null,
  folder_name   text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.drive_folders is
  'Maps each category to its corresponding Google Drive folder';

create trigger trg_drive_folders_updated_at
  before update on public.drive_folders
  for each row execute function public.set_updated_at();

alter table public.drive_folders enable row level security;

create policy "drive_folders_select_authenticated"
  on public.drive_folders for select
  to authenticated
  using (true);

create policy "drive_folders_write_admin"
  on public.drive_folders for all
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());
