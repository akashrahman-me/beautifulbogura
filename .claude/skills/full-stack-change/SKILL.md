---
name: full-stack-change
description: Workflow for any Beautiful Bogura change that crosses the API and a UI (new feature, new field, new endpoint, changed rule, new permission). Gives the order to work in across cloud, client and console, and the list of files that must stay in sync. Use whenever a change touches more than one app.
---

# A change across cloud ↔ client / console

Work outside-in from the contract, then make every copy agree. Skipping a step leaves demo mode, the docs
or the console silently out of date.

## 0. Understand

- Read `CLAUDE.md` (root), then the `architecture.md` of every app you will touch.
- Find the existing feature end to end: `cloud/src/modules/<name>/`, `client/src/features/<name>/`,
  `console/src/features/<name>/`, plus its section in `plans/features.md` / `plans/console.md`.
- Search for the nearest existing example and copy its shape. The repo is consistent, so the closest sibling
  module is the best template.

## 1. Contract first

Write the endpoint in the relevant `API_CONTRACT.md` (`client/` for public, `console/` for `/admin/*`):
path, auth, body, response shape, error codes. Keep the envelope (`{ success, message, data, meta }`) and the
error rules (Bangla `message`, English `code`, `errors[].path` = form field, 400 `VALIDATION_ERROR`).

## 2. Backend (`cloud/`): see the `api-module` skill

Model → validator → service → controller → routes → mount in `src/routes/index.ts` → test. Staff writes
are audited. Then `npm run typecheck && npm run lint && npm test`.

## 3. Demo fakes

Mirror the endpoint in `client/src/mocks/demo-server.ts` and/or `console/src/mocks/demo-server.ts` (and sample
rows in `mocks/data.ts`). `demo` mode must behave like the API, including error codes.

## 4. Front ends: see the `site-feature` and `console-module` skills

Schemas (types + Zod form schema) → api → hooks → components → page. Map server `errors[]` onto form fields.

## 5. Keep shared definitions identical

| Thing | Copies |
|---|---|
| Permissions | `cloud/src/config/permissions.ts`, `console/src/lib/permissions.ts`, `console/src/config/nav.ts`, `plans/console.md` §1 |
| Enums / catalogs | `cloud/src/config/catalog.ts`, `console/src/config/catalog.ts`, client feature `schemas/` |
| Design-system layer | `client/src/components/ui/*`, `src/styles/{tokens,components}.css`, `src/lib/{utils,theme}.ts` in both apps |
| Seed data | `cloud/src/scripts/seed-data.ts` ↔ `console/src/mocks/data.ts` (and client mocks) |

`grep -rn "<enum value or path>" cloud/src client/src console/src` before finishing to catch a missed copy.

## 6. Verify and document

- Run the checks in every touched app, then the browser pass (the `verify` skill) with `NEXT_PUBLIC_DATA_MODE=api`.
- Update READMEs / `plans/*.md` if routes, roles or behaviour visible to users changed. Leave
  `architecture.md` files alone unless the user asks.
- Re-seed (`npm run seed -- --reset`) if testing left junk data.
