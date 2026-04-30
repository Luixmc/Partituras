-- ============================================================
-- 004 · Sheet music — core table
-- ============================================================

create table public.sheets (
  id               uuid primary key default uuid_generate_v4(),

  -- Identification
  title            text not null,
  composer         text,
  arranger         text,
  lyricist         text,
  hymn_number      text,              -- e.g. "HV-042" for hymnary reference

  -- Musical info
  key_signature    text,              -- e.g. "C major", "A minor"
  time_signature   text,              -- e.g. "4/4", "3/4", "6/8"
  tempo            int,               -- BPM (optional)
  tempo_label      text,              -- e.g. "Andante", "Allegro"
  voices           text[],            -- e.g. ARRAY['SATB'] or ARRAY['soprano','alto']
  language         text default 'es', -- ISO 639-1 language code

  -- Content
  editor_type      public.editor_type not null default 'pdf_upload',
  content          text,              -- ABC or LilyPond source text (nullable for pdf_upload)
  lyrics           text,              -- plain-text lyrics for search

  -- Storage references
  storage_path     text,              -- path in Supabase Storage bucket
  drive_file_id    text,              -- Google Drive file ID
  drive_folder_id  text,              -- Google Drive folder ID
  thumbnail_path   text,              -- preview image path in Storage

  -- Classification
  category_id      uuid references public.categories(id) on delete set null,
  status           public.sheet_status not null default 'draft',

  -- Metadata
  duration_seconds int,               -- approximate playback duration
  page_count       int default 1,
  notes            text,              -- internal notes (not shown to viewers)

  -- Ownership / audit
  created_by       uuid not null references public.profiles(id) on delete restrict,
  updated_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz,
  archived_at      timestamptz
);

comment on table public.sheets is
  'Core sheet music catalog';

-- ── updated_at trigger ───────────────────────────────────────
create trigger trg_sheets_updated_at
  before update on public.sheets
  for each row execute function public.set_updated_at();

-- ── published_at / archived_at auto-fill ────────────────────
create or replace function public.handle_sheet_status_change()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and old.status <> 'published' then
    new.published_at = now();
  end if;
  if new.status = 'archived' and old.status <> 'archived' then
    new.archived_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_sheets_status
  before update on public.sheets
  for each row execute function public.handle_sheet_status_change();

-- ── Full-text search index ───────────────────────────────────
create index idx_sheets_search
  on public.sheets
  using gin (
    to_tsvector('spanish',
      coalesce(title,'') || ' ' ||
      coalesce(composer,'') || ' ' ||
      coalesce(lyrics,'') || ' ' ||
      coalesce(notes,'')
    )
  );

create index idx_sheets_category  on public.sheets(category_id);
create index idx_sheets_status    on public.sheets(status);
create index idx_sheets_created   on public.sheets(created_at desc);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.sheets enable row level security;

-- Viewers see only published sheets
create policy "sheets_select_viewer"
  on public.sheets for select
  using (
    status = 'published'
    or created_by = auth.uid()
    or public.is_admin()
  );

-- Musicians can insert their own sheets
create policy "sheets_insert_musician"
  on public.sheets for insert
  to authenticated
  with check (
    public.get_my_role() in ('admin','musician')
    and created_by = auth.uid()
  );

-- Musicians edit only their own; admins edit all
create policy "sheets_update_own"
  on public.sheets for update
  to authenticated
  using (
    created_by = auth.uid()
    and public.get_my_role() in ('admin','musician')
    or public.is_admin()
  )
  with check (
    created_by = auth.uid()
    and public.get_my_role() in ('admin','musician')
    or public.is_admin()
  );

-- Only admins can delete
create policy "sheets_delete_admin"
  on public.sheets for delete
  to authenticated
  using (public.is_admin());
