# Rolli

**A temporary anonymous disposable camera and social deduction experience for friend groups.**

Rolli is a web-based hangout experience where friends join a shared room, capture photos anonymously using nicknames, and reveal every memory only after the hangout ends. The final twist: guess which real person belongs to each anonymous perspective.

---

## What is Rolli?

During a hangout, everyone contributes photos like a shared disposable camera — but with a catch:

- **Anonymous nicknames** — no one knows who is who during the session
- **Hidden photos** — captures stay locked until the hangout ends
- **Delayed reveal** — memories develop cinematically, grouped by perspective
- **Social deduction** — after the reveal, everyone guesses who owned each nickname

The experience is designed to feel **nostalgic, intimate, cinematic, and playful** — not like social media. No likes, comments, followers, or live galleries.

---

## Features

| Flow | Description |
|------|-------------|
| **Landing** | Cinematic intro with soft pastel UI |
| **Quick Guide** | Swipeable slides explaining how Rolli works |
| **Create / Join** | Start a hangout or paste an invitation link |
| **Waiting Room** | Anonymous hold — only participant count is visible |
| **Active Session** | Capture memories (max 10 per user) with no previews |
| **Reveal** | Film development animation, perspective-by-perspective unlock |
| **Guessing** | Private votes to match nicknames to real names |
| **Gallery** | Final memory grid with download options |

### Roles & rules (high level)

- **Film Keeper** — the room creator; starts and ends the hangout
- **Max 10 participants** per room
- **2–10 participants** required to start (Film Keeper cannot start alone)
- **Auto-end** after 24 hours if no one ends the session manually

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | [Next.js](https://nextjs.org) (App Router), [React](https://react.dev), [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Forms & validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| State | [Zustand](https://zustand.docs.pmnd.rs) |
| Animation | [Framer Motion](https://www.framer.com/motion) |
| Icons | [Lucide React](https://lucide.dev) |
| Backend | [Supabase](https://supabase.com) — PostgreSQL + Storage |

---

## Project status

> **Implemented (MVP)** — full end-to-end hangout flow is live: waiting → active session → developing → reveal → guessing → completed gallery.

### Implemented

- Mobile-responsive pastel UI shell
- Landing, guide, start, create, and join flows
- Supabase schema, RPC functions, and storage bucket migrations
- Create hangout (Film Keeper + invitation link), join, waiting room with live participant count
- Film Keeper can start hangout (2–10 participants) via database RPC
- Camera capture + upload to Supabase Storage
- Developing screen and Film Keeper reveal controls
- Reveal phase with perspective unlock flow
- Guessing phase with private votes and score/results
- Final gallery with per-photo and zip download actions
- Automatic end after 24h (poll-based, optional pg_cron background job)

### Planned

- Realtime subscriptions (reduce polling)
- Auth/rejoin hardening beyond session token
- Ops jobs for cleanup/maintenance

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20+ (LTS recommended)
- npm (included with Node)

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in order from [`rolli/supabase/migrations/`](rolli/supabase/migrations/) (see [`rolli/supabase/README.md`](rolli/supabase/README.md)).
3. Copy `rolli/.env.local.example` → `rolli/.env.local` (or create `rolli/.env`) and add your project URL and anon key.

### Install & run

The Next.js app lives in the `rolli/` subdirectory:

```bash
git clone <your-repo-url>
cd Rolli/rolli
cp .env.local.example .env.local   # then edit with your Supabase keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy (Vercel)

Set **Root Directory** to `rolli` in the Vercel project settings. Leave **Output Directory** empty (Next.js default). Add the same env vars as local, with `NEXT_PUBLIC_APP_URL` set to your production URL.

### Other scripts

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

### Try the flow

1. **Start** → **Create Invitation Link** — enter title, nickname, and real name
2. Copy the generated link and open it in another browser (or incognito)
3. **Paste Invitation Link** on the join screen with a different nickname
4. Both users land in the waiting room; Film Keeper can start when 2+ people are in
5. Capture photos in session, then Film Keeper taps **Develop Memories**
6. Continue through reveal, guessing, and final gallery

---

## Project structure

```text
Rolli/
├── README.md                          # You are here
├── Rolli — Project Documentation.txt  # Full product spec
└── rolli/                             # Next.js application + Supabase
    ├── supabase/
    │   ├── README.md                  # Migration setup guide
    │   └── migrations/                # SQL to run in Supabase
    ├── src/
    │   ├── app/                       # Routes (App Router)
    │   ├── components/                # UI, layout, feature components
    │   ├── lib/
    │   │   ├── services/              # Supabase hangout API
    │   │   └── supabase/              # Browser client & row mappers
    │   ├── store/                     # Zustand session (participant token)
    │   └── types/                     # Shared TypeScript types
    ├── vercel.json
    └── package.json
```

---

## Design direction

Rolli uses a **soft, pastel, minimalist** aesthetic — glassmorphism, rounded cards, gentle gradients, and cinematic motion. The goal is an emotionally engaging experience that feels temporary and mysterious, not feed-driven.

---

## License

Private project — license TBD.
