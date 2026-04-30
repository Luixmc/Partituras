-- ============================================================
-- 008 - Songs and song sections
-- ============================================================

alter type public.editor_type add value if not exists 'musicxml';

create table if not exists public.songs (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  composer         text,
  author           text,
  key_signature    text,
  time_signature   text not null default '4/4',
  style            text,
  tempo            int,
  tempo_label      text,
  language         text not null default 'es',
  lyrics           text,
  chord_chart      text,
  category_id      uuid references public.categories(id) on delete set null,
  status           public.sheet_status not null default 'draft',
  storage_path     text,
  drive_file_id    text,
  created_by       uuid not null references public.profiles(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.song_sections (
  id           uuid primary key default uuid_generate_v4(),
  song_id      uuid not null references public.songs(id) on delete cascade,
  label        text not null,
  section_type text,
  chord_chart  text,
  repeat_count int not null default 1,
  dynamics     text,
  band_notes   text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_songs_status on public.songs(status);
create index if not exists idx_songs_category on public.songs(category_id);
create index if not exists idx_song_sections_song on public.song_sections(song_id, sort_order);

drop trigger if exists trg_songs_updated_at on public.songs;
create trigger trg_songs_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

drop trigger if exists trg_song_sections_updated_at on public.song_sections;
create trigger trg_song_sections_updated_at
  before update on public.song_sections
  for each row execute function public.set_updated_at();

alter table public.songs enable row level security;
alter table public.song_sections enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'songs' and policyname = 'songs_select_viewer'
  ) then
    create policy "songs_select_viewer"
      on public.songs for select
      using (
        status = 'published'
        or created_by = auth.uid()
        or public.is_admin()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'songs' and policyname = 'songs_insert_musician'
  ) then
    create policy "songs_insert_musician"
      on public.songs for insert
      to authenticated
      with check (
        public.get_my_role() in ('admin','musician')
        and created_by = auth.uid()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'songs' and policyname = 'songs_update_own'
  ) then
    create policy "songs_update_own"
      on public.songs for update
      to authenticated
      using (
        (created_by = auth.uid() and public.get_my_role() in ('admin','musician'))
        or public.is_admin()
      )
      with check (
        (created_by = auth.uid() and public.get_my_role() in ('admin','musician'))
        or public.is_admin()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'song_sections' and policyname = 'song_sections_select'
  ) then
    create policy "song_sections_select"
      on public.song_sections for select
      using (
        exists (
          select 1 from public.songs s
          where s.id = song_id
            and (
              s.status = 'published'
              or s.created_by = auth.uid()
              or public.is_admin()
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'song_sections' and policyname = 'song_sections_write_musician'
  ) then
    create policy "song_sections_write_musician"
      on public.song_sections for all
      to authenticated
      using (
        public.get_my_role() in ('admin','musician')
        and exists (
          select 1 from public.songs s
          where s.id = song_id
            and (s.created_by = auth.uid() or public.is_admin())
        )
      )
      with check (
        public.get_my_role() in ('admin','musician')
        and exists (
          select 1 from public.songs s
          where s.id = song_id
            and (s.created_by = auth.uid() or public.is_admin())
        )
      );
  end if;
end $$;
