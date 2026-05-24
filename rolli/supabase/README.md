# Rolli — Supabase setup

Database migrations and Supabase CLI config for the Rolli app. This folder lives alongside the Next.js app in `rolli/`.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Copy **Project URL** and **anon public key** from **Settings → API**.

## 2. Run migrations

In the Supabase Dashboard, open **SQL Editor** and run each file **in order**:

| Order | File |
|-------|------|
| 1 | `migrations/001_initial_schema.sql` |
| 2 | `migrations/002_rls_and_grants.sql` |
| 3 | `migrations/003_rpc_functions.sql` |
| 4 | `migrations/004_storage.sql` |
| 5 | `migrations/005_random_hangout_slug.sql` |
| 6 | `migrations/006_photo_capture.sql` |
| 7 | `migrations/007_reveal_flow.sql` |
| 8 | `migrations/008_guessing.sql` |
| 9 | `migrations/009_gallery.sql` |
| 10 | `migrations/010_auto_end_hangout.sql` |
| 11 | `migrations/011_guessing_and_start_rules_hardening.sql` |
| 12 | `migrations/012_fix_photo_upload_storage_rls.sql` |
| 13 | `migrations/013_ensure_reveal_rpcs.sql` (run if reveal RPCs are missing) |
| 14 | `migrations/014_leave_rejoin_and_join_rules.sql` |
| 15 | `migrations/015_enable_hangout_realtime.sql` |
| 16 | `migrations/016_hardening_misc.sql` |

See **[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)** for verification SQL, Realtime setup, and optional pg_cron / slot cleanup jobs.

**Migration overrides:** `003_rpc_functions.sql` is the historical baseline. Later files replace key RPCs — especially **005** (slug), **011** (start rules), **012** (storage RLS), **013** (reveal), **014** (leave/rejoin/join), **016** (`end_hangout`).

Or with the [Supabase CLI](https://supabase.com/docs/guides/cli), from the **`rolli/`** directory (parent of this folder):

```bash
cd rolli
supabase link --project-ref <your-project-ref>
supabase db push
```

## 3. Configure the Next.js app

From `rolli/`, create your env file and add your Supabase keys:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel), set the same variables in the project dashboard. Use your live URL for `NEXT_PUBLIC_APP_URL` (e.g. `https://rolli.vercel.app`).

Restart `npm run dev` after changing env vars locally.

## 4. Storage

Migration `004_storage.sql` creates a private bucket `hangout-photos`. Migration `006_photo_capture.sql` adds upload slots, capture RPCs, and storage policies for the camera feature.

## 5. Auto-end after 24 hours

Migration `010_auto_end_hangout.sql` ends active hangouts automatically when `started_at` is more than 24 hours ago (same as Film Keeper tapping **Develop Memories** → status `developing`).

- **On every poll:** `get_hangout_public` checks and auto-ends that hangout if expired (works with the app’s 2s sync).
- **Realtime:** migration **015** publishes `hangouts` for instant status updates; polling remains as fallback.
- **Optional background job:** enable the `pg_cron` extension, then schedule `auto_end_expired_hangouts()` every 15 minutes (SQL snippet at the bottom of `010_auto_end_hangout.sql`) so hangouts end even when nobody has the app open. See [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) — do not enable cron without opting in.

## Leave / rejoin (014)

- **`leave_hangout`** — marks participant inactive; Film Keeper cannot leave while status is `waiting`.
- **`rejoin_hangout`** — reactivates a participant who left, using the same `session_token`.
- **`join_hangout`** — reactivates an inactive nickname row; blocks duplicate active nicknames and real names (case-insensitive).

If a user clears browser storage without leaving, they cannot recover their session (MVP limitation).

## Schema overview

- **hangouts** — room metadata, status, Film Keeper reference
- **participants** — anonymous nicknames, hidden real names, session tokens
- **photos** — storage paths (files in `hangout-photos` bucket)
- **votes** — private guessing phase answers

Sensitive operations use **SECURITY DEFINER** RPC functions so the anon key never exposes raw tables directly.

## Folder layout note

```text
rolli/
├── supabase/          ← you are here (migrations, this README)
├── src/lib/supabase/  ← Next.js Supabase client code (different folder)
└── .env.local         ← app environment variables
```
