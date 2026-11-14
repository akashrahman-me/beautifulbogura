---
name: site-feature
description: Add or change a feature, page, form or list on the public site in client/ (Next.js 16) following client/architecture.md and the project's helpers (api client, community post helpers, RequireSignIn, skeletons, design-system components, demo server). Use for any client/ work.
---

# Public site work in `client/`

**First read `client/architecture.md`.** It is binding: thin server pages, client feature components,
the API client, Query setup, skeleton rules, social sign-in, forms, where each kind of state lives, and the build
order (§19). The product inventory is `plans/features.md`. The routes are in `client/README.md`.
For styling and copy, also follow the `ui-and-copy` skill.

## Feature shape

`src/features/<name>/` with `schemas/<name>.schema.ts` (types + Zod form schemas) → `api/<name>.api.ts` +
`<name>.keys.ts` → `hooks/` → `components/` → `index.ts` (the only import surface). The route
`src/app/<path>/page.tsx` is a server component: `metadata` and `<Suspense fallback={<…Skeleton/>}>` around
one feature component. Dynamic params are read inside the boundary (Cache Components is on).

Templates: `job` (owned community post: list, detail, form, owner manage), `video` (simple infinite list),
`doctor` (public submission + detail), `donor` (register + phone-matched update), `voter` (lookup that needs a filter).

## Building blocks

| Need | Use |
|---|---|
| HTTP | `api` from `@/lib/api-client` (`get`, `getPaginated`, `post`, `patch`, `delete`). Envelope parsing, `ApiError` (`code`, `errors`), Bearer token and one silent refresh on 401. Never `fetch` in components. |
| Query keys / hooks | `createKeys(name)` from `@/lib/community`; `useInfiniteQuery` + `keepPreviousData` for lists (`flatPages`, `totalOf`, `PAGE_SIZE`). |
| Community posts | `createCommunityApi(base)` + `createCommunityHooks(...)` in `@/lib/community` give list / detail / create / update / manage / report for the six post kinds. Owner UI: `PostActions`, `PostDialogs`, `PostedSuccess` in `components/shared/`. |
| Sign-in | Wrap post forms in `<RequireSignIn>` (shows provider buttons before the form). `useSession()` for the user. Never send `ownerId`. The API sets it. |
| Forms | React Hook Form + `zodResolver`. `phoneField`, `takaField`, `honeypot` from `@/lib/validation`. On a failed mutation call `applyApiErrors(form, error)` (`@/lib/form`) so `errors[].path` lands on fields. |
| Photos | `uploadImages(files)` (`@/lib/upload`) → URLs, then send URLs in the body. `FileDrop` UI primitive. |
| Filters / search / tabs | In the URL with `nuqs` (`useQueryStates`). Not in component state. |
| States | Skeletons from `components/shared/Skeleton.tsx` shaped like the content; `ErrorState` (with retry) and `EmptyState` from `components/shared/States.tsx`. |
| Page blocks | `PageHeader`, `SectionHeader`, `StatStrip`, `FilterBar`, `ContactActions`, `PhoneLink`, `NoticeBanner`, `LoadMore` (`components/shared/Blocks.tsx`); `ListingCard`. |
| Service tiles / nav | `src/config/services.ts` (`SERVICES`, `QUICK_LINKS`, `SOCIAL`), `components/layout/` (header, bottom nav, footer). |
| Helpers | `bn`, `bnNumber`, `formatDate`, taka, Bangla calendar, `tel:` / WhatsApp links in `@/lib/utils`; `cn`. |

## Demo mode must keep working

Every endpoint the site calls is also faked in `src/mocks/demo-server.ts` with data in `src/mocks/data.ts`.
Add or change the fake together with the API. It must return the same envelope and error codes.

## Done means

- `npm run typecheck && npm run lint && npm test` in `client/`. Run `npm run build` when routes, config or
  Suspense boundaries changed (Cache Components errors appear only in the build).
- The page works in the browser against the real API (`verify` skill), signed out and signed in, on a
  phone-width viewport, in light and dark themes.
- The contract in `client/API_CONTRACT.md` matches what the feature calls.
