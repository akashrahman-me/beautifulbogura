# বিউটিফুল বগুড়া (Beautiful Bogura)

A Bangla-first, mobile-first community portal for Bogura: public services, emergency numbers, doctors and
blood donors, 26 directories, community posts (jobs, buy & sell, to-let, car rent, tuition, matrimony),
education, area information, the voter roll, people lists and videos. Staff run it from a separate console.

This file is the entry point for AI agents. Read it fully, then the docs it points to for the part you touch.

## The monorepo

| Dir | What | Stack | Port |
|---|---|---|---|
| `client/` | Public site | Next.js 16 · React 19 · TanStack Query · nuqs · Zustand · RHF + Zod 4 · Tailwind v4 + design-system `bb-*` classes | 3000 |
| `console/` | Staff dashboard (admin / moderator / editor) | Same as client | 3001 |
| `cloud/` | REST API for both | Express 5 · TypeScript (→ CommonJS) · Mongoose 9 · Zod 4 · JWT + refresh cookies · pino | 4000 |
| `plans/` | Product docs: `features.md` (feature inventory), `console.md` (console plan, roles, UX rules) | | |

Not a workspace: each app has its own `package.json`, `node_modules` and lockfile. Use **npm** (not pnpm/yarn).
`console/.npmrc` sets `legacy-peer-deps`. Node ≥ 22.

## Architecture docs: binding, owned by the user

Each app has an `architecture.md`. **Read it before changing that app, and follow it.** Do not edit these
files unless the user asks; if the code must depart from one, say so to the user.

| App | Architecture | Also read |
|---|---|---|
| `cloud/` | [`cloud/architecture.md`](cloud/architecture.md): modules, layers, envelope, errors, auth, testing, build order (§15) | `cloud/README.md` |
| `client/` | [`client/architecture.md`](client/architecture.md): rendering, features, API client, Query, skeletons, auth, forms, state, build order (§19) | `client/README.md`, `client/API_CONTRACT.md`, `plans/features.md` |
| `console/` | [`console/architecture.md`](console/architecture.md): the same frontend guide as the client's | `console/README.md`, `console/API_CONTRACT.md`, `plans/console.md` |

Where the code deliberately refines the guides (keep doing it this way):
- **Frontend styling** uses the project design system instead of shadcn / next-themes: `src/styles/tokens.css`
  (CSS variables, light + dark), `src/styles/components.css` (`bb-*` component classes) and primitives in
  `src/components/ui/`. Theme is `<html data-theme>` via `src/lib/theme.ts`. The design system itself is a
  claude.ai artifact linked from `client/README.md`.
- **Next 16 Cache Components** is on: pages read dynamic params inside a `<Suspense>` boundary.
- **Frontends have two data modes:** `NEXT_PUBLIC_DATA_MODE=api` (default, talks to `cloud/`) or `demo`
  (an in-browser fake in `src/mocks/demo-server.ts`, opt-in, never a fallback).
- **cloud** compiles to CommonJS (NodeNext, no `.js` import suffixes). `jose` is ESM-only and loaded with
  `import()`. Routes are declared with `defineRoutes` (`src/utils/defineRoutes.ts`), which builds the
  `authenticate → authorize → use → validate` chain and registers each route for the generated OpenAPI. Staff-edited
  collections reuse `src/utils/content.ts` (CRUD + soft delete + restore + audit). Validation failures are
  400 `VALIDATION_ERROR`.

## Things that must stay in sync across apps

| When you change… | Also update |
|---|---|
| An endpoint (path, body, response, error code) | `cloud` module + its test → `client/API_CONTRACT.md` or `console/API_CONTRACT.md` → that app's `src/mocks/demo-server.ts` → the feature's `schemas/` + `api/` |
| Roles / permissions | `cloud/src/config/permissions.ts` ↔ `console/src/lib/permissions.ts` ↔ `plans/console.md` §1 ↔ `console/src/config/nav.ts` |
| An enum (post kinds, directory types, categories, cadres, unions…) | `cloud/src/config/catalog.ts` ↔ `console/src/config/catalog.ts` ↔ the client feature schema (e.g. `DIRECTORY_TYPES`) |
| The design-system layer (`components/ui/*`, `tokens.css`, `components.css`, `lib/utils.ts`, `lib/theme.ts`) | Copy the change to both `client/` and `console/` (console's `Icon.tsx` has extra icons) |
| Seed / sample data | `cloud/src/scripts/seed-data.ts` (copied from `console/src/mocks/data.ts`) and the mocks |

## Product rules (apply everywhere)

- **Accounts:** social sign-in only (Google / Facebook / Apple). No passwords, no PINs, no sign-up page;
  the first sign-in creates the account. Browsing needs no account; creating an owned post does.
  Owners manage their own posts (403 `NOT_OWNER` otherwise).
- **Bangla first:** all user-facing copy in Bangla; numerals through `bn()`, dates via `formatDate` in
  `lib/utils.ts`. API error `message`s are Bangla too (shown to users); `code`s are English constants.
- **Let the UI speak:** prefer icons, layout, badges and states to explanatory text, but never shorten an
  important phrase. Buttons are verbs. Status is a word in a `Badge`, never colour alone. Red (`emergency`) only
  for destructive or emergency. Skeletons, not spinners, for data loading.
- **Staff actions** that have consequences take a reason. Every staff write is audited. Deletes are soft
  and restorable.
- **The frontend gate is UX only.** The API enforces auth, ownership and permissions.

## Run it locally

```bash
cd cloud && npm run db                # MongoDB 8 replica set on :27017 (keep running)
cd cloud && npm run seed -- --reset   # sample data
cd cloud && npm run dev               # API on :4000, docs at /api/docs
cd client && npm run dev              # :3000
cd console && npm run dev             # :3001
```

`.claude/launch.json` has `client` and `console` entries for the preview browser. Without provider keys,
sign-in goes to the API's dev page (`/api/v1/auth/dev`). Seeded accounts: `admin@` / `moderator@` /
`editor@example.com` (console), `user1…20@example.com` (site; `user7` banned). Details: `.claude/skills/run-locally`.

## Checks before calling work done

| App | Commands |
|---|---|
| cloud | `npm run typecheck && npm run lint && npm test` (Vitest + Supertest + in-memory Mongo), `npm run build` |
| client / console | `npm run typecheck && npm run lint && npm test`, `npm run build` for routing/config changes |

For anything a user can see, also verify it in the browser against the real API. See `.claude/skills/verify`.

## Skills (`.claude/skills/`)

| Skill | Use when |
|---|---|
| `run-locally` | Starting, seeding or resetting the stack; signing in locally; ports and env |
| `full-stack-change` | Any change that crosses API ↔ UI: the order to work in and what to keep in sync |
| `api-module` | Adding or changing a `cloud/` module or endpoint |
| `site-feature` | Adding or changing a `client/` feature or page |
| `console-module` | Adding or changing a `console/` module, table, form or permission |
| `ui-and-copy` | Any UI work: design system, Bangla copy, the "let the UI speak" rule, states |
| `verify` | Testing: unit/integration checks plus the end-to-end browser pass |

## Known gaps (as of 2026-11-14)

- Real Google / Facebook / Apple credentials and VAPID push keys are not set yet (`cloud/.env`); the dev
  sign-in page stands in. Setup steps: `cloud/README.md` → "Before going live".
- The client still hard-codes home slides, the notice bar and contact/posting settings. It should read
  `GET /home/slides`, `/site/notice`, `/site/settings` (`plans/console.md` §5).
- Rejection / removal reasons are not yet shown to submitters on the site.
- The design-system layer is copied between client and console; a shared `packages/ui` is planned.
- Uploads are written to local disk (`cloud/uploads`); use object storage if the host disk is not persistent.
