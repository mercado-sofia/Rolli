# Rolli app

Next.js application for [Rolli](../README.md) — a temporary anonymous disposable camera and social deduction experience for friend groups.

For product overview and features, see the **[repository README](../README.md)**.

## Quick start

From this directory (`rolli/`), create `.env.local` with your Supabase keys (see [`supabase/README.md`](supabase/README.md)), then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Supabase migrations live in [`supabase/migrations/`](supabase/migrations/). Run them in order — see [`supabase/README.md`](supabase/README.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Deploy (Vercel)

Set **Root Directory** to `rolli`. Add the same env vars as local, with `NEXT_PUBLIC_APP_URL` set to your production URL.

## Key routes

| Path | Phase |
|------|--------|
| `/` | Landing + guide |
| `/start`, `/create`, `/join` | Setup flows |
| `/h/[slug]/waiting` | Waiting room |
| `/h/[slug]/share` | Share invitation link |
| `/h/[slug]/session` | Active capture |
| `/h/[slug]/reveal` | Developing overlay + reveal |
| `/h/[slug]/guessing` | Guessing + results |
| `/h/[slug]/gallery` | Final memory gallery |

`/h/[slug]/developing` redirects to `/reveal` for old links.
