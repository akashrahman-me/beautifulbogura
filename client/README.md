# বিউটিফুল বগুড়া — web client

Bangla-first, mobile-first portal for every public service, directory and community listing in Bogura.
Built to `architecture.md`, the feature list in `../plans/features.md`, and the
[Beautiful Bogura design system](https://claude.ai/artifact/4BZ2R24ZRJDtLbCZ7fDEfN).

## Run it

```bash
npm install
```

```bash
npm run dev
```

Runs on <http://localhost:3000>. Start the API first (see [`../cloud/README.md`](../cloud/README.md)).

Create `.env.local` (see `.env.example`):

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express API base, e.g. `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | This site's URL |
| `NEXT_PUBLIC_DATA_MODE` | `api` (default) talks to the backend. `demo` serves bundled sample data from `src/mocks/` through the same API client — opt-in only, never a fallback. |

**Local sign-in:** until real provider keys are in `cloud/.env`, the Google / Facebook / Apple buttons open the API's development sign-in page (`/api/v1/auth/dev`). There you pick a seeded account (`user1@example.com` … owns seeded posts) or type any name and email.

**Demo mode** (`NEXT_PUBLIC_DATA_MODE=demo`, no API needed): any sign-in button signs you in at once as a demo user. The first seeded post of each kind belongs to that user, so you can try the owner controls.

**Accounts:** browsing needs nothing. Posting a job, sale, to-let, car or tuition ad asks you to sign in with Google, Facebook or Apple — the first sign-in creates the account, there is no sign-up page and no PIN. Owners manage their posts on the post itself or at `/account`. Provider setup lives in the API (see [`API_CONTRACT.md`](API_CONTRACT.md#accounts-social-sign-in-only)).

Other scripts: `npm run typecheck`, `npm run lint`, `npm test` (Vitest), `npm run build`.

## How it is put together

- **`src/app/`** — routes only. Pages are server components that render one feature component inside `<Suspense>` with a skeleton fallback. Dynamic ids (`/doctors/[id]`, `/jobs/[id]`, `/education/[id]`) are read inside the boundary so the shell still prerenders (Cache Components is on).
- **`src/features/auth/`** — social sign-in: provider buttons, the `RequireSignIn` gate in front of post forms, header account button, `/account` page. Session state is `src/stores/session.store.ts`.
- **`src/features/<name>/`** — `schemas/` (Zod + types) → `api/` (endpoint functions, query-key factory) → `hooks/` (TanStack Query) → `components/`. Other code imports a feature only through its `index.ts`.
- **`src/lib/`** — `api-client.ts` (envelope parsing, `ApiError`, token refresh, demo transport), `query-client.ts`, `community.ts` (shared API + hooks for owner-managed community posts), `validation.ts` (Bangla-aware phone / taka fields), `utils.ts` (Bangla numerals, ৳, Bangla calendar, `tel:` / WhatsApp links), `theme.ts`.
- **`src/components/ui/`** — the design-system primitives (Button, Badge, Chip, Tabs, Field, FileDrop, Dialog, Icon…). **`components/shared/`** — page blocks (PageHeader, FilterBar, NoticeBanner, ContactActions, ListingCard, owner-manage / report dialogs, skeletons, empty / error states). **`components/layout/`** — header, bottom nav, footer.
- **Styling** — `src/styles/tokens.css` mirrors the design system's `tokens.json` (light + dark). `src/styles/components.css` is the design system's component stylesheet (`bb-*` classes) in Tailwind's `components` layer; page layout uses Tailwind utilities backed by the same tokens (`bg-surface`, `text-ink-muted`, `text-h2`…).
- **State** — server data in TanStack Query; filters, search, tabs and list/map view in the URL (nuqs); recently viewed services and favourites in a persisted Zustand store; the signed-in user in `session.store` (access token in memory only, refresh via httpOnly cookie); theme on `<html data-theme>`.

## Routes

| Area | Routes |
|---|---|
| Home & shell | `/`, `/services`, `/search`, `/weather`, `/emergency`, `/account` |
| Health | `/doctors`, `/doctors/[id]`, `/doctors/new`, `/blood-bank`, `/blood-bank/register` |
| Directories (26 types) | `/directory/[type]`, `/directory/[type]/add` — police, fire service, ambulance, electricity, hospitals, offices, banks, couriers, ISPs, lawyers, journalists, kazi, parlours, gyms, markets, travel, restaurants, hotels, tourist spots, cooks, band party, graphics & printing (rated), IT experts, matchmakers, cleaners |
| Community (sign in with Google / Facebook / Apple to post; owner-managed) | `/jobs`, `/jobs/[id]`, `/jobs/new`, `/buy-sell`, `/buy-sell/new`, `/to-let`, `/to-let/new`, `/car-rent`, `/car-rent/new`, `/tuition`, `/tuition/new`, `/workers`, `/workers/register` |
| Education | `/education` (list / map), `/education/[id]` (notices, claim), `/education/new` |
| Area introduction | `/area`, `/area/municipality`, `/area/unions`, `/area/administration` |
| Public service | `/voter-info` (lookup by name / voter no. / date of birth, union filter) |
| People lists | `/freedom-fighters`, `/notable-persons`, `/notable-persons/[id]` (biography), `/achievers` (successful sons & daughters, by cadre) |
| Marriage | `/marriage` (bride / groom, religion), `/marriage/register` (sign-in, owner-managed like community posts) |
| Media | `/videos` (category filter; plays in a dialog via youtube-nocookie) |

The backend contract the client expects is in [`API_CONTRACT.md`](API_CONTRACT.md).
