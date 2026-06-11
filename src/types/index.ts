// ─────────────────────────────────────────────
// Database enums
// ─────────────────────────────────────────────
export type UserRole    = "admin" | "musician" | "viewer";
export type SheetStatus = "draft" | "published" | "archived";
export type EditorType  = "abc" | "lilypond" | "pdf_upload" | "musicxml";
export type ServiceType = "viernes" | "domingo" | "ayuno" | "santa_cena" | "otro";

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

// ─────────────────────────────────────────────
// Cultos / setlists
// ─────────────────────────────────────────────
export interface Service {
  id:           string;
  name:         string;
  service_type: ServiceType;
  service_date: string | null;   // ISO date (YYYY-MM-DD)
  notes:        string | null;
  is_public:    boolean;
  public_token: string;
  created_by:   string;
  created_at:   string;
  updated_at:   string;
}

// Canción lista para el modo presentación (incluye el contenido de acordes).
export interface PresentSong {
  title:        string;
  composer:     string | null;
  original_key: string | null;   // tonalidad original (sheet.key_signature)
  target_key:   string | null;   // tono elegido para el culto (key_override)
  content:      string | null;
  editor_type:  EditorType;
}

export interface ServiceSong {
  service_id:   string;
  sheet_id:     string;
  position:     number;
  key_override: string | null;
  sheet_key_id: string | null;   // versión guardada de la canción (opcional)
  note:         string | null;
}

// Versión por tono disponible para elegir al armar un culto.
export interface SheetKeyOption {
  id:            string;
  key_signature: string;
  label:         string | null;
}

// Canción dentro de un culto, ya enriquecida con datos de la partitura.
export interface ServiceSongItem {
  sheet_id:       string;
  position:       number;
  key_override:   string | null;
  sheet_key_id:   string | null;
  note:           string | null;
  title:          string;
  composer:       string | null;
  key_signature:  string | null;
  category_name:  string | null;
  category_color: string | null;
  available_keys: SheetKeyOption[];   // versiones guardadas de esta canción
}

export interface ServiceWithSongs extends Service {
  songs: ServiceSongItem[];
}

// Versión de una canción en otra tonalidad (acordes editables).
export interface SheetKey {
  id:            string;
  sheet_id:      string;
  key_signature: string;
  content:       string | null;
  label:         string | null;
  sort_order:    number;
  created_by:    string;
  created_at:    string;
  updated_at:    string;
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
