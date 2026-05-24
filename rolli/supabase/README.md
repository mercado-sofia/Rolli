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

Migration `004_storage.sql` creates a private bucket `hangout-photos` for captured memories. Photo upload from the app will use this bucket in a later feature.

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
