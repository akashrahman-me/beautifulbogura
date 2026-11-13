# বিউটিফুল বগুড়া — web client

Bangla-first, mobile-first portal for every public service, directory and community listing in Bogura.
Built to `architecture.md`, the feature list in `../plans/features.md`, and the
[Beautiful Bogura design system](https://claude.ai/artifact/4BZ2R24ZRJDtLbCZ7fDEfN).

## Run it

```bash
pnpm install
```

```bash
pnpm dev
```

Create `.env.local` (see `.env.example`):

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express API base, e.g. `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | This site's URL |
| `NEXT_PUBLIC_DATA_MODE` | `api` (default) talks to the backend. `demo` serves bundled sample data from `src/mocks/` through the same API client — opt-in only, never a fallback. |

Until the backend exists, run with `NEXT_PUBLIC_DATA_MODE=demo`. Every seeded community post uses the PIN **1234**.

Other scripts: `pnpm typecheck`, `pnpm lint`, `pnpm test` (Vitest), `pnpm build`.

## How it is put together

- **`src/app/`** — routes only. Pages are server components that render one feature component inside `<Suspense>` with a skeleton fallback. Dynamic ids (`/doctors/[id]`, `/jobs/[id]`, `/education/[id]`) are read inside the boundary so the shell still prerenders (Cache Components is on).
- **`src/features/<name>/`** — `schemas/` (Zod + types) → `api/` (endpoint functions, query-key factory) → `hooks/` (TanStack Query) → `components/`. Other code imports a feature only through its `index.ts`.
- **`src/lib/`** — `api-client.ts` (envelope parsing, `ApiError`, token refresh, demo transport), `query-client.ts`, `community.ts` (shared API + hooks for anonymous PIN-managed posts), `validation.ts` (Bangla-aware phone / PIN / taka fields), `utils.ts` (Bangla numerals, ৳, Bangla calendar, `tel:` / WhatsApp links), `theme.ts`.
- **`src/components/ui/`** — the design-system primitives (Button, Badge, Chip, Tabs, Field, PinInput, FileDrop, Dialog, Icon…). **`components/shared/`** — page blocks (PageHeader, FilterBar, NoticeBanner, ContactActions, ListingCard, PIN / report dialogs, skeletons, empty / error states). **`components/layout/`** — header, bottom nav, footer.
- **Styling** — `src/styles/tokens.css` mirrors the design system's `tokens.json` (light + dark). `src/styles/components.css` is the design system's component stylesheet (`bb-*` classes) in Tailwind's `components` layer; page layout uses Tailwind utilities backed by the same tokens (`bg-surface`, `text-ink-muted`, `text-h2`…).
- **State** — server data in TanStack Query; filters, search, tabs and list/map view in the URL (nuqs); recently viewed services and favourites in a persisted Zustand store; theme on `<html data-theme>`.

## Routes

| Area | Routes |
|---|---|
| Home & shell | `/`, `/services`, `/search`, `/weather`, `/emergency` |
| Health | `/doctors`, `/doctors/[id]`, `/doctors/new`, `/blood-bank`, `/blood-bank/register` |
| Directories (26 types) | `/directory/[type]`, `/directory/[type]/add` — police, fire service, ambulance, electricity, hospitals, offices, banks, couriers, ISPs, lawyers, journalists, kazi, parlours, gyms, markets, travel, restaurants, hotels, tourist spots, cooks, band party, graphics & printing (rated), IT experts, matchmakers, cleaners |
| Community (no login, PIN-managed) | `/jobs`, `/jobs/[id]`, `/jobs/new`, `/buy-sell`, `/buy-sell/new`, `/to-let`, `/to-let/new`, `/car-rent`, `/car-rent/new`, `/tuition`, `/tuition/new`, `/workers`, `/workers/register` |
| Education | `/education` (list / map), `/education/[id]` (notices, claim), `/education/new` |
| Area introduction | `/area`, `/area/municipality`, `/area/unions`, `/area/administration` |
| Not built yet | `/soon/[slug]` placeholders: voter info, freedom fighters, notable persons, successful sons & daughters, matrimonial, videos |

The backend contract the client expects is in [`API_CONTRACT.md`](API_CONTRACT.md).
