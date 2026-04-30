-- ============================================================
-- 001 · Extensions and base enum types
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";   -- accent-insensitive search
create extension if not exists "pg_trgm";    -- fuzzy / similarity search

-- ── User roles ───────────────────────────────────────────────
create type public.user_role as enum (
  'admin',     -- full read/write/delete access
  'musician',  -- create and edit own sheets
  'viewer'     -- read-only access
);

-- ── Sheet status ─────────────────────────────────────────────
create type public.sheet_status as enum (
  'draft',     -- only visible to creator and admins
  'published', -- visible to all users
  'archived'   -- hidden from main catalog
);

-- ── Editor / content type ────────────────────────────────────
create type public.editor_type as enum (
  'abc',        -- ABC notation
  'lilypond',   -- LilyPond notation
  'pdf_upload'  -- directly uploaded PDF
);
