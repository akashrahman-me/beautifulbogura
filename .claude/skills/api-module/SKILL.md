---
name: api-module
description: Add or change a module or endpoint in cloud/ (the Express + MongoDB API) following cloud/architecture.md and the project's helpers (defineRoutes, contentService, audit, submissions, ApiError, tests). Use for any backend work.
---

# Backend work in `cloud/`

**First read `cloud/architecture.md`.** It is binding: feature modules, layer responsibilities, envelope,
errors, env, naming, security, testing, and the build order for a new module (§15). This skill adds the
project-specific helpers on top of it.

## Module shape

`src/modules/<name>/` with `<name>.model.ts` → `.validator.ts` → `.service.ts` → `.controller.ts` →
`.routes.ts` → `.test.ts` (tests live beside the code; `tests/` holds only setup, helpers and app-level tests).
Dependencies flow one way: routes → controller → service → model. Services never touch `req` / `res`.

Closest templates:
- Simple public list + staff CRUD: `video`
- Public submissions reviewed by staff: `doctor`, `directory`, `institution`
- Owned community posts with discriminators: `post`
- Single documents (GET / PUT): `site`, `area`
- Actions with reasons + transactions + audit: `report`, `user`, `staff`

## Building blocks (use them, don't re-invent)

| Need | Use |
|---|---|
| Routes | `defineRoutes(base, tag)` from `@/utils/defineRoutes`. `r.get(path, { summary, schema, auth?: 'optional' \| 'user', permission?, use?, status? }, handler)`. It builds `authenticate → authorize(permission) → use[] → validate(schema)` and registers the route for OpenAPI. Every route needs a `summary`. |
| Mount | Add the export to `PUBLIC` or `ADMIN` in `src/routes/index.ts`. More specific bases go first (`/admin/area/unions` before `/admin/area`). |
| Validation | Zod schema `z.object({ body?, query?, params? })`. Parsed values land in `req.validated`. Shared pieces in `defineRoutes.ts`: `objectId`, `idParams`, `reasonBody`, `bdPhone`, `optionalBdPhone`, `httpUrl`, `optionalUrl`, `honeypot`, `queryBool`, `imageUrl`. Lists: `listQuery(max, default)` + `pageMeta`, `toSort`, `searchFilter` from `@/utils/pagination`. Don't call `.partial()` on a refined object; keep the plain object and refine a separate create schema (see `post.validator.ts`). |
| Staff CRUD collection | `contentSchema({...})` (`@/utils/model`: adds `deletedAt` + timestamps) → `contentService({ model, noun, label, searchFields, sortable, defaultSort, filter?, toAdmin?, prepare? })` → `contentController(service, 'Noun')` → `registerContentRoutes(adminRoutes, controller, { permission, noun, body, filters? })`. You get list / get / create / patch / soft delete / restore, all audited. |
| Public list | `publicList(model, filter, q, sort)` from `@/utils/content`. The filter must exclude `deletedAt`, hidden and unpublished. |
| Responses | `sendResponse(res, { statusCode?, message, data, meta? })`. `res.status(204).end()` for deletes. Serialize with `withId` / `withIds` / `omit` (`@/utils/serialize`). |
| Errors | `throw ApiError.badRequest / unauthorized / forbidden / notFound / conflict(msg, CODE)` or `ApiError.field(path, msg)` for a field-level rule. Bangla `message`, SCREAMING_SNAKE `code`. Express 5 forwards async throws, so no try/catch in controllers. |
| Who is calling | `req.user = { id, role, app, banned }` (role/ban re-read from DB each request). `actorOf(req)` (`@/utils/actor`) for audit. |
| Audit | `audit.record(actor, { action, type, id, label, reason?, changes? }, session)`. Every staff write. `diff(before, after)` for `changes`. |
| Transactions | `withTransaction(async (session) => …)` (`@/utils/transaction`) when a write spans documents (e.g. write + audit, ban + remove posts). |
| Public submission | `submissionService.submit(...)` for the request, plus `submissionService.registerPublisher(kind, fn)` in the target module to publish on approval (avoids import cycles). |
| Rate limits | `writeLimiter`, `lookupLimiter`, `authLimiter` from `@/middlewares/rateLimiter` via `use: [...]` (skipped in tests). |
| Uploads | Clients upload first (`POST /uploads` → URLs), then send URLs validated with `imageUrl`. |
| Config | Only `env` from `@/config/env` (ESLint bans `process.env` elsewhere). New variable → schema in `env.ts` + `.env.example` + README. Enums → `src/config/catalog.ts`. Permissions → `src/config/permissions.ts`. |

## Conventions

- Mongoose 9: use `returnDocument: 'after'` (not `new: true`), `.lean()` for reads, `as` casts on strict
  filters where the generic types fight you (see `post.service.ts`). Index what lists filter and sort on.
- Soft delete via `deletedAt`; public reads always filter `deletedAt: null`.
- Never accept owner, role, featured, verified or status from public bodies. The server sets them.
- Keep public responses lean: `omit` internal fields (`deletedAt`, reporter hashes, phone where private).

## Tests (Vitest + Supertest + in-memory replica set)

`import { api, resetDb, signIn, staff, member, tomorrow } from '../../../tests/helpers'`, then
`beforeEach(resetDb)`. Cover:
- the happy path and the response shape
- 400 validation, 401 without a token, 403 for the wrong role or non-owner, 404
- that the audit entry is written

Run `npm run typecheck && npm run lint && npm test`. Then `npm run build` if config or imports changed.

## Then

Update `client/API_CONTRACT.md` / `console/API_CONTRACT.md` and the matching `src/mocks/demo-server.ts`
(see the `full-stack-change` skill). Check the route at `http://localhost:4000/api/docs`.
