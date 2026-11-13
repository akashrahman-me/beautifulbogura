# বিউটিফুল বগুড়া — console

The staff dashboard for the public site in [`../client`](../client): moderation, community posts, users,
every directory and list, announcements, staff roles, audit log and settings. Same stack and architecture
as the client (Next.js 16 · React 19 · TanStack Query · nuqs · Zustand · React Hook Form + Zod · Tailwind v4
with the design-system tokens). The plan behind it: [`../plans/console.md`](../plans/console.md).

## Run it

```bash
npm install
```

```bash
npm run dev
```

Runs on <http://localhost:3001>. Create `.env.local` from `.env.example`:

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express API base, e.g. `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | This console's URL |
| `NEXT_PUBLIC_SITE_URL` | The public site, for “সাইটে দেখুন” links |
| `NEXT_PUBLIC_DATA_MODE` | `api` (default) or `demo` — an in-browser fake of the whole admin API with sample data. Opt-in only, never a fallback. |

**Demo mode:** any sign-in button signs you in as an admin. The account menu has a role switcher (প্রশাসক /
মডারেটর / সম্পাদক) to try what each role sees. Data lives in memory, so a full page reload resets it; the
sign-in survives.

Other scripts: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. `.npmrc` sets
`legacy-peer-deps` because the shared dev dependencies carry a peer-range conflict (vitest ↔ `@types/node`).

## How it is put together

- **`src/app/`** — routes only. `(console)/` is the signed-in shell (guard + sidebar + top bar); `login/` is outside it.
- **`src/features/<module>/`** — `schemas/` → `api/` → `hooks/` → `components/`, imported through `index.ts`.
  Modules: `dashboard`, `review`, `reports`, `posts`, `users`, `directory`, `doctors`, `donors`, `workers`,
  `institutions` (+ notices), `area`, `people` (freedom fighters, notable persons, achievers), `voters`,
  `announcements` (slides, site notice, push), `videos`, `staff`, `audit`, `settings`, `auth`.
- **`src/components/admin/`** — the console toolkit: `DataTable` (server sort / page / select, cards on
  phones), `CrudPage` (search + filters + table + edit sheet + delete with undo), `ResourceSheet`, `SpecForm`
  (forms described as data), `RepeatField`, `DocEditor` (single documents), `Sheet`, `ConfirmDialog`,
  `ReasonDialog`, `Toolbar`, `FilterSelect`, `StatusBadge`, `Menu`, `Charts`.
- **`src/lib/resource.ts`** — `createResource(base, noun)` gives list / get / save / remove / restore /
  custom actions with query keys, invalidation and Bangla toasts.
- **`src/lib/permissions.ts`** — the role matrix. `useCan`, `<Can>`, `<RequirePermission>` hide what a role
  cannot do; the API enforces it.
- **`src/components/ui/`, `src/styles/`, `src/lib/utils.ts`** — copied from the client's design-system
  layer; `src/styles/console.css` adds the shell, table, sheet and chart styles on the same tokens.
- **State** — server data in TanStack Query; page, search, sort, filters, the open sheet (`?edit=`, `?open=`)
  in the URL; the signed-in staff member in `session.store`; sidebar collapse in `ui.store`.

## Routes

| Area | Routes |
|---|---|
| Overview | `/` dashboard, `/login` |
| Moderation | `/review` (J / K / A / R), `/reports` |
| Community | `/posts`, `/users` |
| Data | `/directory`, `/doctors`, `/donors`, `/workers`, `/institutions` (+ notices tab), `/area` (profile, unions, administration, municipality) |
| People | `/people/freedom-fighters`, `/people/notable`, `/people/achievers`, `/voters` |
| Outreach | `/announcements` (home slides, site notice, push notifications), `/videos` |
| Admin | `/staff`, `/audit`, `/settings` |

Press <kbd>/</kbd> or <kbd>⌘K</kbd> anywhere for the command palette.

The backend contract is in [`API_CONTRACT.md`](API_CONTRACT.md).
