# Partituras — Sheet Music Manager

Web application for managing, editing, and sharing sheet music for **Centro Cristiano La Casa de mi Padre**.

Built with **Next.js 14 · Supabase · Google Drive · Vercel**.

---

## Database migrations

All migrations live in `supabase/migrations/` and must be applied in order.

### Apply with Supabase CLI (local dev)

```bash
# 1. Install CLI (if not already installed)
npm install -g supabase

# 2. Link to your Supabase project
supabase link --project-ref <your-project-ref>

# 3. Push all migrations
supabase db push
```

### Apply manually (Supabase Dashboard)

1. Open your project → **SQL Editor**
2. Run each file in order:
   - `20240001_extensions_types.sql`
   - `20240002_profiles.sql`
   - `20240003_categories_tags.sql`
   - `20240004_sheets.sql`
   - `20240005_versions_tags_favorites.sql`
   - `20240006_storage_drive.sql`
   - `20240007_search_views.sql`

---

## Storage bucket setup

After running migrations, create the storage bucket manually in Supabase Dashboard → **Storage**:

| Field | Value |
|---|---|
| Bucket name | `sheets` |
| Public | **OFF** (private, signed URLs only) |
| File size limit | `20 MB` |
| Allowed MIME types | `application/pdf, image/jpeg, image/png, image/webp` |

---

## Database schema overview

```
profiles          ← extends auth.users (roles: admin / musician / viewer)
categories        ← Hymns, Choruses, Worship, Special Music, Instrumental...
tags              ← free-form labels
sheets            ← core table: ABC/LilyPond content + PDF storage refs
sheet_versions    ← immutable revision history per sheet
sheet_tags        ← many-to-many sheets ↔ tags
favorites         ← bookmarked sheets per user
drive_sync_log    ← audit log for Google Drive sync operations
drive_folders     ← maps each category → Google Drive folder ID
```

---

## Environment variables (Next.js)

Create a `.env.local` file at the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Drive (service account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=partituras@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_ROOT_FOLDER_ID=your-root-folder-id
```

---

## Roadmap

- [x] Database schema + RLS
- [ ] Next.js 14 project scaffold
- [ ] Auth (sign in / sign up)
- [ ] Sheet catalog — browse, filter, search
- [ ] ABC editor with live preview (VexFlow)
- [ ] PDF upload and viewer
- [ ] PDF generation for print (@react-pdf/renderer)
- [ ] Google Drive sync (Edge Function)
- [ ] Mobile-responsive layout (PWA)
- [ ] Admin panel (user management, categories)
