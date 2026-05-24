# Rolli migration checklist

Run migrations **in order** in the Supabase SQL Editor (or `supabase db push` from `rolli/`). After adding or changing RPCs, reload the API schema:

```sql
NOTIFY pgrst, 'reload schema';
```

Or use **Dashboard → Settings → API → Reload schema**.

## Ordered migrations (001–016)

| # | File | Purpose |
|---|------|---------|
| 1 | `001_initial_schema.sql` | Tables, enums, participant count trigger |
| 2 | `002_rls_and_grants.sql` | RLS policies |
| 3 | `003_rpc_functions.sql` | Core RPCs (historical baseline; later files override) |
| 4 | `004_storage.sql` | `hangout-photos` bucket |
| 5 | `005_random_hangout_slug.sql` | Random slug on create |
| 6 | `006_photo_capture.sql` | Upload slots + camera RPCs |
| 7 | `007_reveal_flow.sql` | Reveal RPCs |
| 8 | `008_guessing.sql` | Guessing + votes |
| 9 | `009_gallery.sql` | Gallery RPC |
| 10 | `010_auto_end_hangout.sql` | 24h auto-end + optional pg_cron snippet |
| 11 | `011_guessing_and_start_rules_hardening.sql` | Start 2–10, vote uniqueness |
| 12 | `012_fix_photo_upload_storage_rls.sql` | Storage RLS helpers (supersedes 007 read policy) |
| 13 | `013_ensure_reveal_rpcs.sql` | Recreate reveal RPCs if missing |
| 14 | `014_leave_rejoin_and_join_rules.sql` | Leave, rejoin, join hardening |
| 15 | `015_enable_hangout_realtime.sql` | Realtime on `hangouts` |
| 16 | `016_hardening_misc.sql` | `end_hangout` active-only, slot cleanup RPC |

**Notes**

- **012** supersedes storage read policy from **007** when both ran; **013** is a safety net if **007** was skipped.
- **003** on disk is the original RPC set; **005**, **011**, **012**, **013**, **014**, and **016** replace or extend those functions.

## Verify required RPCs exist

Run in SQL Editor:

```sql
SELECT p.proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'create_hangout_with_keeper',
    'join_hangout',
    'leave_hangout',
    'rejoin_hangout',
    'get_hangout_public',
    'start_hangout',
    'end_hangout',
    'prepare_photo_upload',
    'capture_photo',
    'can_upload_to_storage_path',
    'can_read_hangout_photo',
    'start_reveal',
    'get_reveal_state',
    'finish_reveal',
    'submit_vote',
    'finish_guessing',
    'get_gallery',
    'auto_end_hangout_if_expired',
    'cleanup_expired_photo_upload_slots'
  )
ORDER BY p.proname;
```

You should see **19 rows**. If any are missing, run the migration that defines them.

## Realtime (015)

If `ALTER PUBLICATION supabase_realtime ADD TABLE public.hangouts` fails:

1. Open **Database → Replication** in the Supabase Dashboard.
2. Enable replication for the `hangouts` table.

The app still polls every 2s as a fallback.

## Optional: pg_cron auto-end

From `010_auto_end_hangout.sql` — enable only if you want hangouts to end without any client open:

1. Enable the `pg_cron` extension.
2. Schedule `SELECT public.auto_end_expired_hangouts();` every 15 minutes.

## Optional: cleanup upload slots

After **016**, you can schedule:

```sql
SELECT public.cleanup_expired_photo_upload_slots();
```

Deletes unused `photo_upload_slots` rows past `expires_at`.

## Session / leave behavior (MVP)

- **Leave room** calls `leave_hangout` and clears browser storage.
- **Rejoin** via invite: same `session_token` in storage → `rejoin_hangout`; otherwise use the same nickname on the join form (inactive row reactivation).
- **Lost localStorage without leaving** cannot rejoin — user must be invited again as a new guest (or use the same nickname if their row was left inactive).
