---
name: run-locally
description: Start, seed, reset or stop the Beautiful Bogura stack (MongoDB, cloud API, client site, console) on this machine, sign in locally without real OAuth keys, and fix common startup problems. Use before any manual or browser testing.
---

# Run the stack locally

Four processes. Start them in this order and keep each running (as background tasks or terminal tabs). Never run a
dev server with a blocking foreground command.

| # | Where | Command | Serves |
|---|---|---|---|
| 1 | `cloud/` | `npm run db` | MongoDB 8 single-node replica set `rs0` on `127.0.0.1:27017`, data in `cloud/.data/db` (persists) |
| 2 | `cloud/` | `npm run seed -- --reset` | Drops the DB and loads sample data (one-off; run while 1 is up) |
| 3 | `cloud/` | `npm run dev` | API `http://localhost:4000`: `/health`, `/api/v1/*`, `/api/docs` (Swagger) |
| 4 | `client/` · `console/` | `npm run dev` | Site `:3000` · console `:3001` |

In the Claude desktop app, start 4 with `preview_start` using the `client` / `console` entries in
`.claude/launch.json`. Check the API with `curl -s localhost:4000/health`.

## Env files (all gitignored)

- `cloud/.env`: copy from `cloud/.env.example`. Generate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
  `OAUTH_STATE_SECRET` with `openssl rand -base64 48`. Locally keep `COOKIE_SECURE=false`, `AUTH_DEV_LOGIN=true`.
  The env is Zod-validated at boot (`src/config/env.ts`); a bad value stops the server with the field name.
- `client/.env.local`, `console/.env.local`: copy from `.env.example`. `NEXT_PUBLIC_DATA_MODE=api` uses the
  real API; `demo` uses the in-browser fake (no API needed). Restart `next dev` after changing env.

## Signing in locally

No provider keys → every Google / Facebook / Apple button navigates to `GET /api/v1/auth/dev`, a plain page that
stands in for the provider (production refuses it).

| Account | Where |
|---|---|
| `admin@example.com` · `moderator@example.com` · `editor@example.com` | Console (one-click shortcuts on the dev page) |
| `user1@example.com` … `user20@example.com` | Site. They own the seeded posts; `user7` is banned (cannot post). |
| Any other name + email | Site: a new account. Console: refused with `?authError=not_staff` unless invited or in `ADMIN_EMAILS`. |

From scripts or tests, `POST /api/v1/auth/dev` (form: `provider, app=site|console, returnTo, name, email`) sets
the refresh cookie (`bb_rt` / `bb_rt_console`). Then call `POST /api/v1/auth/refresh` with
`Origin: http://localhost:3000|3001` and that cookie to get `{ accessToken, user }`. `cloud/tests/helpers.ts`
does exactly this (`signIn`, `staff(role)`, `member()`).

## Reset and clean up

- Remove test data after manual or E2E testing: `cd cloud && npm run seed -- --reset`.
- Wipe the DB completely: stop `npm run db`, delete `cloud/.data/`, start it again.
- Uploaded photos live in `cloud/uploads/` (gitignored).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE` on 27017 / 4000 / 3000 / 3001 | Something is already running. `lsof -i :<port>` and reuse it, or stop it. |
| API: `Transaction numbers are only allowed on a replica set` | `MONGODB_URI` must include `?replicaSet=rs0` and point at `npm run db` (or a real replica set). |
| Front end shows network errors / CORS | API not running, or `CLIENT_URL` / `CONSOLE_URL` in `cloud/.env` don't match the origin. |
| Signed out after every reload | Cookie not stored: `COOKIE_SECURE=true` on plain http, or `NEXT_PUBLIC_API_URL` host differs from the one the cookie was set on (use `localhost` everywhere, not `127.0.0.1`). |
| Console says "এই অ্যাকাউন্টে কনসোলের অনুমতি নেই" | That email has no staff role. Use a seeded staff account or invite it. |
| Hidden browser pane: page stuck on skeletons | Hidden panes pause `requestAnimationFrame`; take a screenshot or show the pane, or check data with `fetch` in `javascript_tool`. |
