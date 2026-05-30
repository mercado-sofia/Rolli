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
| **Share** | Copy or share the invitation link from the waiting room |
| **Active Session** | Capture memories (max 10 per user) with no previews |
| **Developing & Reveal** | Single `/reveal` route: developing overlay with preload, then perspective-by-perspective unlock |
| **Guessing** | Private votes to match nicknames to real names; hangout-wide vote progress |
| **Gallery** | Final memory grid with participant labels and download options |

### Roles & rules (high level)

- **Film Keeper** — the room creator; starts and ends the hangout, controls reveal
- **Film Keeper transfer** — if the Keeper leaves, host duties pass to the next guest
- **Abandon** — Film Keeper can cancel a hangout still in the waiting room
- **Max 10 participants** per room
- **2–10 participants** required to start (Film Keeper cannot start alone)
- **Mid-session join** — new guests can join while status is `waiting` or `active`; returning participants rejoin with `rejoin_hangout` through post-capture phases
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
| Icons | [Lucide React](https://lucide.dev), [React Icons](https://react-icons.github.io/react-icons/) |
| Backend | [Supabase](https://supabase.com) — PostgreSQL + Storage |

---

## Project status

> **Implemented (MVP)** — full end-to-end hangout flow is live: waiting → active session → developing → reveal → guessing → completed gallery.

### Implemented

- Mobile-responsive pastel UI shell
- Landing page (how-it-works guide section), start, create, and join flows
- Supabase schema, RPC functions, and storage bucket migrations (**001–031**)
- Create hangout (Film Keeper + invitation link), join, waiting room with live participant count
- Share invitation link page in the waiting room
- Film Keeper can start hangout (2–10 participants) or abandon while waiting
- Film Keeper transfer when the host leaves mid-hangout
- Guests can join during active capture; returning participants rejoin via saved session through later phases
- RPC rate limiting on create, join, poll, and photo upload (migration **031**)
- Reveal photos gated until Film Keeper signals start (`reveal_pending_at`; migration **031**)
- Camera capture + upload to Supabase Storage
- Developing overlay on `/reveal` with reveal photo preload for all guests
- Client-side reveal countdown, then perspective-by-perspective unlock
- Guessing phase with private votes, hangout-wide progress, and score/results
- Gallery opens once every participant has submitted all guesses (any guest can advance)
- Final gallery with participant labels, per-photo and zip download actions
- Automatic end after 24h (poll-based, optional pg_cron background job)
- Canonical route guard (wrong phase URLs redirect automatically; `/developing` → `/reveal`)
- Supabase Realtime on `hangouts` with poll fallback
- Leave room + rejoin via invite (migration **014**)
- Signed URL refresh on tab focus; download retries

### Planned

- Automated E2E tests
- Full auth / magic-link rejoin without a prior `leave_hangout`

### Session recovery (MVP)

If browser storage is cleared **without** using **Leave room**, the old `session_token` is lost and the user cannot call `rejoin_hangout`. Inactive nicknames cannot be reclaimed via **Join** (migration **031**) — use **Leave room** before clearing storage, or pick a new nickname. See [rolli/supabase/README.md](rolli/supabase/README.md) (Leave / rejoin / join).

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20+ (LTS recommended)
- npm (included with Node)

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL migrations **001–031** in order (see [`rolli/supabase/README.md`](rolli/supabase/README.md)).
3. Create `rolli/.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (required for correct invite link previews, e.g. `http://localhost:3000`)

### Install & run

The Next.js app lives in the `rolli/` subdirectory:

```bash
git clone <your-repo-url>
cd Rolli/rolli
# create .env.local — see Supabase setup above
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
6. On `/reveal`, guests see the developing overlay while photos preload; Film Keeper starts the cinematic reveal
7. Everyone guesses who took each shot; the gallery opens once all votes are in
8. Browse and download memories from the final gallery

---

## Project structure

```text
Rolli/
├── README.md                          # You are here
└── rolli/                             # Next.js application + Supabase
    ├── README.md                      # App quick start
    ├── supabase/
    │   ├── README.md                  # Migration setup guide
    │   └── migrations/                # SQL to run in Supabase (001–031)
    ├── src/
    │   ├── app/                       # Routes (App Router)
    │   ├── components/                # UI, layout, feature components
    │   ├── hooks/                     # Hangout sync, route guards, reveal preload
    │   ├── lib/
    │   │   ├── hangout/               # Domain helpers (routes, reveal, guessing)
    │   │   ├── services/              # Supabase RPC wrappers
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
