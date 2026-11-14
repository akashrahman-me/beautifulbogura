# Admin API contract expected by the console

Base: `NEXT_PUBLIC_API_URL` (local: `http://localhost:4000/api/v1`). Same envelope, pagination and error
rules as the public API (`../client/API_CONTRACT.md`). The server is `cloud/`. Its OpenAPI document at
`http://localhost:4000/api/docs` is generated from the route table, so it is the final word.
`src/mocks/demo-server.ts` mirrors every endpoint for `NEXT_PUBLIC_DATA_MODE=demo`. Keep it in step.

## Auth and roles

Staff use the same social sign-in as the public site: `GET /auth/:provider?returnTo=/path&app=console`
returns to `CONSOLE_URL + returnTo`. The console has its own refresh cookie (`bb_rt_console`), separate from
the site's `bb_rt`. The API tells the two apps apart by the request's `Origin`, so signing out of one leaves the
other signed in. `POST /auth/refresh` returns `{ accessToken, user }` where `user.role` is
`admin | moderator | editor | null`. A non-staff sign-in to the console redirects to
`/login?authError=not_staff`. A refresh for someone who lost their role gets 401 `NOT_STAFF`.
`POST /auth/logout` revokes the session.

Who becomes staff:
- Verified emails listed in `ADMIN_EMAILS` become admins on first sign-in.
- Everyone else needs an invite (`POST /admin/staff`). The invite is accepted the first time that verified
  email signs in.

Locally, `/auth/dev` has one-click shortcuts for the seeded `admin@`, `moderator@` and `editor@example.com`.
The API re-reads role and ban status from the database on every request, so a role change takes effect at once.

Every `/admin/*` route requires a staff role and one permission (plans/console.md §1); otherwise
401 `UNAUTHENTICATED` / 403 `FORBIDDEN`. Every write appends an audit entry (who, action, resource,
reason, changed fields) in the same transaction.

| Permission | Routes |
|---|---|
| `dashboard.view` | `/admin/counts`, `/admin/dashboard`, `/admin/search` |
| `review.manage` | `/admin/submissions*` |
| `reports.manage` | `/admin/reports*` |
| `posts.manage` | `/admin/posts*` |
| `users.manage` | `/admin/users*` |
| `content.manage` | `/admin/directory`, `/doctors`, `/donors`, `/workers`, `/institutions`, `/notices`, `/area/*`, `/freedom-fighters`, `/notable-persons`, `/achievers`, `/videos` |
| `announcements.manage` | `/admin/slides`, `/admin/site-notice`, `/admin/push` |
| `voters.manage` | `/admin/voters*` |
| `staff.manage` | `/admin/staff*` |
| `settings.manage` | `/admin/settings` |
| `audit.view` | `/admin/audit` |

## Conventions for resources

Every list: `?page&limit&search&sort` (`field` or `-field`) plus its filters → paginated.
CRUD resources also take `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` (soft; body may carry
`{ reason, note }`) and `POST /:id/restore`. Photos arrive as URLs from `POST /uploads`.
Errors that the UI handles: 409 `ALREADY_DECIDED`, `STAFF_EXISTS`, `LAST_ADMIN`, `SELF`, `IS_STAFF` (ban a
staff member: remove their role first); 404 `NOTHING_TO_RESTORE`; 400 `VALIDATION_ERROR` (`errors[].path` maps
onto the form field; voter search under 3 characters lands here too), `BAD_CSV`.

## Shell

| Method & path | Returns |
|---|---|
| `GET /admin/counts` | `{ review, reports }` — sidebar badges (polled every minute) |
| `GET /admin/dashboard` | `{ kpis, activity[30], postsByKind, attention, recent }` — see `features/dashboard/schemas` |
| `GET /admin/search?q=` | `[{ kind, id, label, sub, href }]`, only kinds the caller may see |

## Moderation

| Method & path | Notes |
|---|---|
| `GET /admin/submissions?status&kind` | Public submissions (`doctor`, `directory`, `institution`, `claim`) with the payload in `data` and `priorRejections` for the submitter's phone |
| `POST /admin/submissions/:id/approve` | `{ data? }` — optional edited fields; publishes into the right collection (a claim sets the institution's `claimedBy`) |
| `POST /admin/submissions/:id/reject` | `{ reason, note? }` — reason is shown to the submitter |
| `GET /admin/reports?status=open\|dismissed\|resolved&kind` | Reports grouped per post: `post`, `owner` (incl. `priorRemovals`), `count`, `reasons`, `notes[]`, `autoHidden` |
| `POST /admin/reports/:id/dismiss` | `{ reason? }` — keeps the post; un-hides it if auto-hidden |
| `POST /admin/reports/:id/resolve` | `{ reason, note?, ban }` — removes the post; `ban: true` also bans the owner and hides their other posts |

Posts reaching `settings.moderation.autoHideAfterReports` open reports are hidden (`status: hidden`) until a
moderator decides.

## Community

| Method & path | Notes |
|---|---|
| `GET /admin/posts?kind&status&featured&owner` | All six kinds in one shape (`AdminPost`): owner, status (`active done expired hidden removed`), featured, verified, reports, views, expiresAt |
| `POST /admin/posts/:id/feature` · `/verify` | `{ value: boolean }` |
| `POST /admin/posts/:id/extend` | `{ days }` — from the later of now and the current expiry; revives an expired post |
| `POST /admin/posts/:id/remove` | `{ reason, note? }` — reason shown to the owner |
| `POST /admin/posts/:id/restore` | Back to `active` (or `expired` if past expiry) |
| `GET /admin/users?status&provider` · `GET /admin/users/:id` | Public accounts with post / removal / report counts and `ban { reason, at, by }` |
| `POST /admin/users/:id/ban` | `{ reason, note? }` — blocks posting, removes their active posts |
| `POST /admin/users/:id/unban` | Hidden posts stay hidden; restore them from posts |

## Content (CRUD)

`/admin/directory?type&verified&hidden`, `/admin/doctors?specialty` (chambers: `days` 0 = Sunday … 6),
`/admin/donors?group&status=ready|not-yet|unknown`, `/admin/workers?trade`,
`/admin/institutions?type&union` (`lat`/`lng` nullable, `claimedBy`, `notices` count),
`/admin/notices?institution` (`pinned`), `/admin/area/unions`, `/admin/freedom-fighters?union`,
`/admin/notable-persons?field` (`published` draft flag, `body` paragraphs split by blank lines),
`/admin/achievers?cadre`, `/admin/videos?category` (`youtubeId`, `thumbnail`, `duration` seconds, `published`),
`/admin/slides` (`order`, `tone`, `icon`, `eyebrow`, `title`, `body`, `cta { label, href }`, `startsAt`, `endsAt`, `active`).
Every item carries `hidden` (or `published`) so it can leave the site without being deleted, and `updatedAt`.

## Documents (GET / PUT the whole document)

| Path | Shape |
|---|---|
| `/admin/area/profile` | `{ name, summary, stats[{label,value}], sections[{id,title,body}] }` |
| `/admin/area/administration` | `{ officials[{role,name,phone,photo}], formerUnos[{name,term}] }` |
| `/admin/area/municipality` | `{ name, summary, stats[], services[], wards[{number,councillor,phone}] }` |
| `/admin/site-notice` | `{ enabled, severity: info\|warning\|emergency, title, body, linkLabel, linkHref, expiresAt }` |
| `/admin/settings` | `{ contact, social, posting, moderation, maintenance }` — see `features/settings` |

Responses add `updatedAt` and `updatedBy`. The public site should read (not wired in the client yet) the notice, slides and settings
from `GET /site/notice`, `GET /home/slides`, `GET /site/settings`.

## Push notifications

`GET /admin/push` — history. `POST /admin/push` `{ title ≤ 60, body ≤ 160, url, audience: all|donors, bloodGroup? }`
sends immediately (Web Push to subscribed browsers) and returns the history entry with `recipients`. Without
`VAPID_*` keys in `cloud/.env` it is recorded with `delivered: false` and nothing is sent.

## Voter roll

| Method & path | Notes |
|---|---|
| `GET /admin/voters/stats` | `{ total, byUnion[{union,total,male,female,third}], lastImport }` |
| `GET /admin/voters?search&union` | `search` ≥ 3 characters required (400 `VALIDATION_ERROR`); **every search is audited** |
| `POST /admin/voters/import` | multipart `file` (CSV, columns `voterNo,name,fatherName,motherName,dob,gender,union,village,centre`); upsert by `voterNo`; returns `{ imported, updated, skipped, errors[{row,message}] }` |
| `GET /admin/voters/imports` | Import history |

## Staff and audit

| Method & path | Notes |
|---|---|
| `GET /admin/staff` | `{ id, name, email, avatar, provider, role, status: active\|invited, invitedBy, invitedAt, lastActiveAt }` |
| `POST /admin/staff` | `{ email, role }` — invite; the role activates when that email first signs in. 409 `STAFF_EXISTS` |
| `POST /admin/staff/:id/role` | `{ role }`. 409 `SELF`, `LAST_ADMIN` |
| `POST /admin/staff/:id/resend` · `DELETE /admin/staff/:id` | Resend invite · remove access (409 `SELF`; signs them out of the console) |
| `POST /admin/staff/:id/restore` | Undo a removal (404 `NOTHING_TO_RESTORE`) |
| `GET /admin/audit?actor&action&type&from&to&search` | Newest first; entries are append-only |
