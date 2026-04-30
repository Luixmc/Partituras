-- ============================================================
-- 005 · Sheet versions, tag junction, and favorites
-- ============================================================

-- ── Version history ──────────────────────────────────────────
create table public.sheet_versions (
  id           uuid primary key default uuid_generate_v4(),
  sheet_id     uuid not null references public.sheets(id) on delete cascade,
  version_num  int not null,
  editor_type  public.editor_type not null,
  content      text,                    -- ABC/LilyPond snapshot
  storage_path text,                    -- PDF snapshot path in Storage
  change_note  text,                    -- optional description of changes
  created_by   uuid not null references public.profiles(id) on delete restrict,
  created_at   timestamptz not null default now(),

  unique (sheet_id, version_num)
);

comment on table public.sheet_versions is
  'Immutable snapshots of each sheet revision';

create index idx_sheet_versions_sheet on public.sheet_versions(sheet_id, version_num desc);

alter table public.sheet_versions enable row level security;

create policy "sheet_versions_select"
  on public.sheet_versions for select
  using (
    public.is_admin()
    or created_by = auth.uid()
    or exists (
      select 1 from public.sheets s
      where s.id = sheet_id and s.status = 'published'
    )
  );

create policy "sheet_versions_insert"
  on public.sheet_versions for insert
  to authenticated
  with check (
    public.get_my_role() in ('admin','musician')
    and created_by = auth.uid()
  );

create policy "sheet_versions_delete_admin"
  on public.sheet_versions for delete
  to authenticated
  using (public.is_admin());

-- ── Auto-increment version number ────────────────────────────
create or replace function public.next_version_num(p_sheet_id uuid)
returns int language sql as $$
  select coalesce(max(version_num), 0) + 1
  from public.sheet_versions
  where sheet_id = p_sheet_id;
$$;

-- ── Sheet ↔ Tag junction ─────────────────────────────────────
create table public.sheet_tags (
  sheet_id   uuid not null references public.sheets(id) on delete cascade,
  tag_id     uuid not null references public.tags(id)   on delete cascade,
  primary key (sheet_id, tag_id)
);

alter table public.sheet_tags enable row level security;

create policy "sheet_tags_select_all"
  on public.sheet_tags for select using (true);

create policy "sheet_tags_write_musician"
  on public.sheet_tags for all
  to authenticated
  using  (public.get_my_role() in ('admin','musician'))
  with check (public.get_my_role() in ('admin','musician'));

-- ── Favorites (bookmarks per user) ───────────────────────────
create table public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sheet_id   uuid not null references public.sheets(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, sheet_id)
);

comment on table public.favorites is
  'Bookmarked sheets per user';

alter table public.favorites enable row level security;

-- Users manage only their own favorites
create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());
