// ─────────────────────────────────────────────
// Database enums
// ─────────────────────────────────────────────
export type UserRole    = "admin" | "musician" | "viewer";
export type SheetStatus = "draft" | "published" | "archived";
export type EditorType  = "abc" | "lilypond" | "pdf_upload" | "musicxml";

// ─────────────────────────────────────────────
// Core entities
// ─────────────────────────────────────────────
export interface Profile {
  id:         string;
  first_name: string;
  last_name:  string | null;
  email:      string;
  role:       UserRole;
  avatar_url: string | null;
  active:     boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id:          string;
  name:        string;
  description: string | null;
  color:       string;
  icon:        string | null;
  sort_order:  number;
  active:      boolean;
}

export interface Tag {
  id:   string;
  name: string;
}

// ─────────────────────────────────────────────
// Sheet music (individual)
// ─────────────────────────────────────────────
export interface Sheet {
  id:              string;
  title:           string;
  composer:        string | null;
  arranger:        string | null;
  lyricist:        string | null;
  hymn_number:     string | null;
  key_signature:   string | null;
  time_signature:  string | null;
  tempo:           number | null;
  tempo_label:     string | null;
  voices:          string[] | null;
  language:        string;
  editor_type:     EditorType;
  content:         string | null;
  lyrics:          string | null;
  storage_path:    string | null;
  drive_file_id:   string | null;
  thumbnail_path:  string | null;
  category_id:     string | null;
  status:          SheetStatus;
  page_count:      number;
  notes:           string | null;
  created_by:      string;
  created_at:      string;
  updated_at:      string;
  published_at:    string | null;
}

export interface SheetVersion {
  id:           string;
  sheet_id:     string;
  version_num:  number;
  editor_type:  EditorType;
  content:      string | null;
  storage_path: string | null;
  change_note:  string | null;
  created_by:   string;
  created_at:   string;
}

// ─────────────────────────────────────────────
// Songs (for mosaics)
// ─────────────────────────────────────────────
export interface Song {
  id:              string;
  title:           string;
  composer:        string | null;
  author:          string | null;
  key_signature:   string | null;
  time_signature:  string;
  style:           string | null;
  tempo:           number | null;
  tempo_label:     string | null;
  language:        string;
  lyrics:          string | null;
  chord_chart:     string | null;
  category_id:     string | null;
  status:          SheetStatus;
  storage_path:    string | null;
  drive_file_id:   string | null;
  created_by:      string;
  created_at:      string;
  updated_at:      string;
}

export interface SongSection {
  id:           string;
  song_id:      string;
  label:        string;
  section_type: string | null;
  chord_chart:  string | null;
  repeat_count: number;
  dynamics:     string | null;
  band_notes:   string | null;
  sort_order:   number;
}

// ─────────────────────────────────────────────
// Mosaics
// ─────────────────────────────────────────────
export interface Mosaic {
  id:              string;
  title:           string;
  description:     string | null;
  key_signature:   string | null;
  time_signature:  string;
  closing_note:    string | null;
  category_id:     string | null;
  status:          SheetStatus;
  storage_path:    string | null;
  drive_file_id:   string | null;
  created_by:      string;
  created_at:      string;
  updated_at:      string;
}

export interface MosaicEntry {
  id:               string;
  mosaic_id:        string;
  song_id:          string;
  position:         number;
  block_label:      string | null;
  repeat_count:     number;
  transition_note:  string | null;
  song?:            Song & { sections?: SongSection[] };
}

// ─────────────────────────────────────────────
// Enriched / view types
// ─────────────────────────────────────────────
export interface SheetCatalogItem {
  id:              string;
  title:           string;
  composer:        string | null;
  hymn_number:     string | null;
  key_signature:   string | null;
  time_signature:  string | null;
  editor_type:     EditorType;
  content?:        string | null;
  status:          SheetStatus;
  category_name:   string | null;
  category_color:  string | null;
  category_icon:   string | null;
  thumbnail_path:  string | null;
  drive_file_id:   string | null;
  page_count:      number;
  tags:            string[] | null;
  created_by_name: string | null;
  published_at:    string | null;
  created_at:      string;
}

export interface MosaicWithEntries extends Mosaic {
  entries:         MosaicEntry[];
  category_name?:  string | null;
  category_color?: string | null;
}
