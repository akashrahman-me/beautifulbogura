---
name: verify
description: How to test Beautiful Bogura changes end to end. Static checks and automated tests per app, then a real browser pass of client and console against the cloud API (sign-in, writes, permissions, audit), then cleanup. Use before reporting any change as done.
---

# Verify a change

"Done" means checked at every layer the change touches, with real output, not assumed.

## 1. Static checks and tests

| App | Run (inside the app dir) |
|---|---|
| `cloud/` | `npm run typecheck && npm run lint && npm test`. Also `npm run build` if imports, config or scripts changed. |
| `client/`, `console/` | `npm run typecheck && npm run lint && npm test`. Also `npm run build` when routes, `next.config.ts`, Suspense boundaries or env changed. |

cloud tests spin up an in-memory replica set per file (first run downloads MongoDB, ~30 s). Add or extend a
test beside the module for every new endpoint or rule (see the `api-module` skill).

## 2. Browser pass against the real API

Start the stack (`run-locally` skill) with `NEXT_PUBLIC_DATA_MODE=api` in both front ends. Then, in the
preview browser (`preview_start` `client` / `console`):

1. Read the console and network logs first. There should be no errors and no failed `/api/v1` calls.
2. Signed-out view: the page renders data (not stuck on skeletons), and filters live in the URL.
3. Sign in via the dev page (`/api/v1/auth/dev`, or the staff shortcuts for the console). Check the return to
   the same page, and that the session survives a reload.
4. Exercise the write: create / edit / mark done / report / approve… Confirm the result shows on the other
   side. Site writes appear in the console. Console approvals and edits appear on the site.
5. Error paths: an invalid form shows Bangla field errors in place (400 `VALIDATION_ERROR`). Check the wrong
   owner or role gets 403, and signed-out gets the sign-in prompt.
6. Console: try each affected role (`admin@`, `moderator@`, `editor@example.com`). Hidden for roles without the
   permission, and the API returns 403 if called anyway. Check the audit log at `/audit`.
7. Phone width (`resize_window` mobile) and dark theme for visual changes, then a screenshot as proof.

Shortcuts:
- Run API checks from the page with `fetch` in `javascript_tool` (`credentials: 'include'` for cookie calls).
- Read the route list at `http://localhost:4000/api/docs`.
- A hidden browser pane pauses animations, so prefer `read_page` / `get_page_text` or show the pane.

## 3. Clean up

- `cd cloud && npm run seed -- --reset` to remove test records.
- Leave dev servers running only if the user is using them.
- Restore any `.env*` you changed.
- Report what was verified and how, and what was not (e.g. real OAuth providers, push delivery without VAPID keys).
