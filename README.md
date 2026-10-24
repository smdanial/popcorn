# PopCorn

A watch diary with a statistics habit. PopCorn combines a Letterboxd-style
poster grid, diary, and lists with Serializd-style episode tracking and a
lifetime watch-time dashboard.

Built with Next.js 16 (App Router), React 19, Prisma 6, SQLite, and Tailwind CSS.

## Features

- **Watch diary** — log films with a date, rating, review, rewatch flag, and
  mood; edit or delete entries from the diary or title page.
- **Lifetime analytics** — total film/TV hours, days, episode count, average
  daily screen time, rating distribution, viewing by weekday and month,
  streaks, year-over-year activity, and a 364-day activity heatmap.
- **TV tracking** — check episodes individually or mark whole seasons; progress,
  episode runtimes, recently watched episodes, and total hours update from the
  same records that feed the stats page.
- **Library and lists** — status and favorite controls plus custom lists with
  posters and progress summaries.
- **TMDB search/import** — search films and series, import their metadata and
  TV seasons/episodes, and keep existing watch history.
- **Accounts** — password auth with an HTTP-only JWT session cookie. Every
  personal page is scoped to the signed-in user.
- **Responsive dark UI** — a warm, cinematic design system built with Tailwind;
  no external font or image hosting required for the demo.

## Quick start

Requirements: Node.js 22.12+, npm, and SQLite (bundled through Prisma).

```bash
npm install
cp .env.example .env
# Set AUTH_SECRET to a long random string, e.g. `openssl rand -hex 32`.
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open <http://localhost:3000>. The seeded demo account is:

```text
Email:    demo@popcorn.app
Password: popcorn
```

The seed creates 14 films, 6 series, 48 watched episodes, 29 diary entries, and
two starter lists. It is safe to rerun: it resets the demo user's records.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | SQLite path; defaults to `file:./dev.db`. |
| `AUTH_SECRET` | Yes | Signs the session JWT. Use a long random value. |
| `TMDB_API_KEY` | For import | TMDB v3 API key. |
| `TMDB_READ_ACCESS_TOKEN` | For import | Alternative TMDB v4 bearer token. |

TMDB is optional. Without either credential, the search page shows setup
instructions and the seeded catalog remains fully usable. With a credential,
search imports metadata, runtimes, posters/backdrops, and full TV season and
episode data.

## Scripts

```bash
npm run dev          # development server
npm run build        # prisma generate + production build
npm start            # run the production build
npm run lint         # ESLint, zero warnings allowed
npm run typecheck    # TypeScript, no emit
npm test             # Vitest unit tests
npm run db:migrate   # create/apply development migrations
npm run db:seed      # reset and reseed demo data
npm run db:studio    # Prisma Studio
```

To regenerate the local SVG poster/backdrop fixtures:

```bash
node scripts/generate-posters.mjs
```

## Project structure

```text
app/
  (auth)/                 Login and signup, split-screen poster layout
  (app)/                  Authenticated shell with desktop/mobile navigation
    dashboard/            Lifetime snapshot and recent activity
    library/              Filters, status controls, poster grid
    diary/                Watch log list and edit/delete actions
    stats/                Lifetime analytics, charts, heatmap
    search/               Local catalog and TMDB import search
    media/[id]/           Title detail, TV tracker, history, similar titles
    lists/                Lists index and list detail
  layout.tsx, icon.svg    Root metadata and app icon
components/               Posters, cards, charts, tracker, dialogs, controls
lib/
  actions/                Server actions for auth and all mutations
  auth.ts                 JWT session creation, reading, and guards
  queries.ts              Dashboard and media-detail reads
  stats.ts                Pure statistics calculations
  stats.test.ts           Analytics unit tests
  stats-data.ts           Database aggregation for the stats page
  episode-progress.ts     Episode/runtime progress calculations
  import.ts, tmdb.ts      TMDB client and import mapping
prisma/
  schema.prisma           Users, media, genres, seasons, episodes, diary, lists
  seed.ts                 Demo account and catalog
  migrations/             Initial SQLite migration
scripts/
  generate-posters.mjs    Local SVG poster/backdrop generator
public/
  posters/, backdrops/    Generated demo artwork
```

## Data model

- `User` owns diary entries, library entries, and lists.
- `Media` is a film or series; genres are many-to-many through `MediaGenre`.
- `Season` and `Episode` belong to a series. Runtimes live on episodes.
- `DiaryEntry` is the source of truth for films watched and ratings/reviews.
- `EpisodeWatch` is the source of truth for TV progress and TV hours.
- `LibraryEntry` stores list-like status and favorite state without duplicating
  watch history.
- `List` and `ListItem` support custom ordered collections.

The aggregate stats are computed from `DiaryEntry`, `EpisodeWatch`, `Season`,
and `Episode` rather than from stored counters. This keeps edits and deletes
consistent everywhere.

## How stats are defined

- **Film time**: sum of watched film runtimes from diary entries.
- **TV time**: sum of runtimes for checked episodes.
- **Episodes watched**: distinct episode watches for the user.
- **Unique films**: distinct media with at least one film log.
- **Average daily time**: total watch minutes divided by the number of days
  between the first and last watch (inclusive), not by all calendar days.
- **Streaks**: consecutive calendar days with at least one film log or episode
  watch, using UTC dates.
- **Top genre**: the genre with the highest number of hours among watched
  titles; episodes contribute their media's genres.

All date handling uses UTC so server timezone changes do not reshuffle the
diary or heatmap.

## Notes and limitations

- This project uses SQLite for zero-setup local development. The Prisma schema
  can be switched to PostgreSQL for deployment, but migrations must be
  regenerated for that provider.
- The seeded poster artwork is generated locally and exists only to make the
  demo self-contained.
- TMDB import mapping is implemented and the UI is complete, but live API
  calls require your own key. Imported titles are cached in the local database
  so subsequent views do not call TMDB.
- The app is a single-user-per-session demo in structure, but all records are
  keyed by `userId` and session-guarded, so multi-user operation is supported.
