# বিউটিফুল বগুড়া — cloud (API)

One REST API for both front ends: the public site ([`../client`](../client)) and the staff console
([`../console`](../console)). Express 5 · TypeScript · MongoDB (Mongoose 9) · Zod 4 · JWT + rotating refresh
cookies · social sign-in (Google / Facebook / Apple). Built to [`architecture.md`](architecture.md).

What it serves is described in [`../client/API_CONTRACT.md`](../client/API_CONTRACT.md) (public) and
[`../console/API_CONTRACT.md`](../console/API_CONTRACT.md) (`/admin/*`). The live OpenAPI document is at
<http://localhost:4000/api/docs> in development. It is generated from the route table, so it is always current.

## Run it locally

Node 22+. Three terminals:

```bash
npm install
```

```bash
npm run db
```

`npm run db` starts MongoDB 8 as a single-node replica set on `127.0.0.1:27017` (transactions need a replica
set). Data persists in `.data/db`. No Docker or system MongoDB needed; the binary is downloaded once.

```bash
npm run seed -- --reset
```

```bash
npm run dev
```

The API runs on <http://localhost:4000> (`/health`, `/api/v1/*`, `/api/docs`). Then start `client` (:3000) and
`console` (:3001) with `npm run dev` in each.

Copy `.env.example` to `.env` first. Generate the three secrets with `openssl rand -base64 48`.

### Signing in locally

With no provider keys set and `AUTH_DEV_LOGIN=true`, every Google / Facebook / Apple button opens
`/api/v1/auth/dev`. This is a plain local page that stands in for the provider. The seed creates these accounts:

| Account | Use |
|---|---|
| `admin@example.com` · `moderator@example.com` · `editor@example.com` | Console staff, one per role (one-click shortcuts on the dev page) |
| `user1@example.com` … `user20@example.com` | Public accounts. They own the seeded posts. `user7` is banned. |
| any other name + email | A new public account, created on first sign-in like a real provider would |

`AUTH_DEV_LOGIN` is refused when `NODE_ENV=production`.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | API with reload (`tsx watch`) |
| `npm run db` | Local MongoDB replica set (dev only) |
| `npm run seed` / `npm run seed -- --reset` | Sample data (`--reset` drops the database first) |
| `npm run typecheck` · `npm run lint` · `npm run format` | `tsc --noEmit` · ESLint (also bans `process.env` outside `config/env.ts`) · Prettier |
| `npm test` | Vitest + Supertest against an in-memory replica set. Each module's `*.test.ts` lives beside it. |
| `npm run build` · `npm start` | Compile to `dist/` (CommonJS, `@/` aliases resolved) · run it |

## How it is put together

```
src/
  config/        env (Zod-validated; the only reader of process.env), db, permissions (role matrix,
                 mirrors console/src/lib/permissions.ts), catalog (every enum: post kinds, directory types…)
  errors/        ApiError (statusCode + code + optional field errors)
  middlewares/   auth (authenticate / optionalAuth / authorize(permission)), validate, rateLimiter,
                 errorHandler, notFound
  utils/         defineRoutes (route helper + registry used for OpenAPI), content (generic CRUD service /
                 controller / routes for staff-edited collections), pagination, serialize, transaction,
                 sendResponse, logger, time
  modules/<name>/  model → validator → service → controller → routes (+ test)
  routes/index.ts  PUBLIC modules, then ADMIN modules under /admin
  docs/openapi.ts  OpenAPI 3.1 from the route registry (z.toJSONSchema)
  scripts/       dev-db, seed, seed-data
  app.ts / server.ts  app wiring / listen + graceful shutdown
tests/           setup (in-memory replica set per file), helpers (signIn, staff(role), member())
```

Key decisions (details in the code comments):

- **Accounts:** social sign-in only. The first sign-in creates the account; a verified email links providers
  to one account. The access JWT (15 min) is held in memory by the front end. The refresh token is a random
  token, stored hashed, rotated on every use. Replaying an old one revokes its whole family. Each app has
  its own cookie (`bb_rt` site, `bb_rt_console` console), told apart by `Origin`. Role and ban status are
  re-read on every request.
- **Staff:** `ADMIN_EMAILS` bootstraps the first admins. Everyone else is invited from the console and gets
  the role on first sign-in with that verified email. The console refuses non-staff (`?authError=not_staff`).
- **Posts:** one `posts` collection with a `postType` discriminator (job, listing, rental, vehicle, tuition,
  matrimony). "Expired" is derived from `expiresAt`. Posting checks ban, maintenance mode and the daily limit
  from site settings.
- **Moderation:** public submissions (doctor, directory entry, institution, claim) wait in `/admin/submissions`.
  Reports are grouped into one case per post, deduplicated per reporter. A post auto-hides at the
  settings threshold.
- **Audit:** every staff write records actor, action, resource, reason and a field diff, in the same
  transaction as the write. Staff deletes are soft (`deletedAt`) and restorable.
- **Uploads:** images only (checked by magic bytes, not by name), ≤ `UPLOAD_MAX_MB`, signed-in users only,
  written to `UPLOAD_DIR` and served at `/uploads/*`. Swap `upload.service.ts` for S3 / R2 in production
  if the server's disk is not persistent.

## Before going live

**Social sign-in.** Register these redirect URIs with each provider, then fill the keys in `.env`:

| Provider | Redirect URI | Notes |
|---|---|---|
| Google | `${API_URL}/api/v1/auth/google/callback` | OAuth client (Web). Scopes `openid email profile`. |
| Facebook | `${API_URL}/api/v1/auth/facebook/callback` | App in Live mode with `email` + `public_profile`. |
| Apple | `${API_URL}/api/v1/auth/apple/callback` | Services ID = `APPLE_CLIENT_ID`; Team ID, Key ID and the `.p8` key. Apple posts back (`form_post`), so the API must be HTTPS. The name arrives only on the first sign-in. |

A provider with keys set is used for real. One without keys falls back to the dev page (development) or
reports `provider_error` (production).

**Production `.env`:**
- `NODE_ENV=production`
- `MONGODB_URI` pointing to Atlas or another replica set
- `API_URL`, `CLIENT_URL` and `CONSOLE_URL` as HTTPS URLs
- `COOKIE_SECURE=true` and `AUTH_DEV_LOGIN=false` (the server refuses to start otherwise)
- `ADMIN_EMAILS` set to the owner's email
- Optional: `VAPID_*` keys (`npx web-push generate-vapid-keys`) to make push notifications deliver

The app trusts one proxy hop in production (`trust proxy = 1`) for client IPs and rate limits. `/api/docs` is
not served in production.

**Front ends:** set `NEXT_PUBLIC_API_URL=https://<api>/api/v1` and `NEXT_PUBLIC_DATA_MODE=api` in both apps.
Cookies are `SameSite=Lax`, so put the API on the same site as the front ends (e.g. `api.example.com`,
`example.com`, `console.example.com`).
