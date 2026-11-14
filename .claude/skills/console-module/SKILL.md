---
name: console-module
description: Add or change a module, page, table, form, filter or permission in the staff console (console/, Next.js 16) using its toolkit (createResource, CrudPage, SpecForm, DocEditor, RequirePermission, nav) and plans/console.md. Use for any console/ work.
---

# Console work in `console/`

**First read `console/architecture.md`** (the same frontend guide as the client's) **and `plans/console.md`**:
roles and the permission matrix (§1), modules (§2), and the operator UX rules (§3: tables first, edit in a
sheet, reasons for consequences, status in words, Bangla first). `console/README.md` lists the toolkit and
routes. For styling and copy, also follow the `ui-and-copy` skill.

## Module shape

`src/features/<module>/` → `schemas/` (types, Zod form schema, `FieldSpec[]`, empty form) → `components/<X>Page.tsx`
→ `index.ts`. The route `src/app/(console)/<path>/page.tsx` only sets `metadata` and renders the page.
`(console)/` is the signed-in shell; `login/` is outside it.

Templates: `videos` (smallest CRUD), `doctors` (repeatable chambers), `review` (split queue + keyboard),
`reports` / `posts` / `users` (custom actions with reasons), `area` + `settings` (`DocEditor` for single
documents), `voters` (CSV import + audited search), `staff`, `audit`, `dashboard` (charts).

## Building blocks

| Need | Use |
|---|---|
| API resource | `createResource<T, Input, Query>('/admin/<x>', 'বাংলা নাম')` (`@/lib/resource`): list / get / save / remove / restore / custom actions + hooks, query keys, invalidation and Bangla toasts (undo on delete). |
| CRUD page | `<CrudPage resource columns searchPlaceholder filters filterNode sheet={{ schema, fields, empty, toForm, title }} />`: search, URL filters, `DataTable` (server sort/page/select, cards on phones), edit `ResourceSheet`, delete with undo. |
| Forms as data | `FieldSpec[]` rendered by `SpecForm` (`text textarea select choice multi checkbox date number phone url email image custom`). Use `RepeatField` for repeatable groups. `applyApiErrors(form, error)` from `@/lib/form`. |
| Single documents | `DocEditor` (GET / PUT whole document, shows `updatedAt` / `updatedBy`). |
| Table cells | `components/admin/Cell.tsx` (`PersonCell`, `TitleCell`, `DateCell`), `StatusBadge`, `Badge` with a word. |
| Filters | `FilterSelect` + `nuqs` `useQueryStates`. Everything in the URL, including the open sheet (`?edit=`, `?open=`). |
| Dialogs | `ConfirmDialog`, `ReasonDialog` (reason chips + note) in `components/admin/Dialogs.tsx`, `Sheet`, `Menu`. |
| Enums | `src/config/catalog.ts` (`labelOf(LIST, value)`). Must match `cloud/src/config/catalog.ts`. |
| Permissions | `<RequirePermission permission="…">` around the page, `<Can>` / `useCan()` for buttons. Matrix in `src/lib/permissions.ts` (must match `cloud/src/config/permissions.ts`). |
| Navigation | `src/config/nav.ts` (group, href, label, icon, permission). Badges come from `GET /admin/counts`. The ⌘K palette uses `/admin/search`. |

## Rules from plans/console.md

- Rejecting, removing or banning asks for a reason. Removals are soft, with an undo toast.
- Optimistic updates only for toggles (feature, verify). Everything else waits for the server.
- The UI hides what a role can't do; the API enforces it (403 `FORBIDDEN`). Every write is audited by the API.

## Backend and demo

Each `/admin/*` endpoint lives in `cloud/` (`api-module` skill). Most content modules use
`registerContentRoutes`, so the console gets list / get / create / patch / delete / restore for free.
Mirror any change in `src/mocks/demo-server.ts` and `console/API_CONTRACT.md`.

## Done means

`npm run typecheck && npm run lint && npm test` in `console/`. Then check in the browser against the real API
(`verify` skill), signed in as each role the change affects (`admin@`, `moderator@`, `editor@example.com`).
Confirm the audit log shows the write.
