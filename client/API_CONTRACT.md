# API contract expected by the web client

Base: `NEXT_PUBLIC_API_URL` (e.g. `https://api.example.com/api/v1`). JSON in and out.
`src/mocks/demo-server.ts` implements every endpoint below in the browser and is the reference behaviour.
Types live in each feature's `schemas/*.schema.ts`.

## Envelope

```jsonc
// success
{ "success": true, "message": "OK", "data": <T>, "meta": { "page": 1, "limit": 12, "total": 40, "totalPages": 4 } }
// failure — switch on `code`, never on `message`; `errors[].path` maps onto form fields
{ "success": false, "message": "ফোন নম্বর ঠিক নেই", "code": "VALIDATION", "errors": [{ "path": "phone", "message": "১১ সংখ্যার মোবাইল নম্বর লিখুন" }] }
```

`meta` is present on list endpoints. Messages are shown to users, so write them in Bangla.
Codes the client handles specially: `UNAUTHENTICATED` (401), `NOT_OWNER` (403), `NOT_FOUND` (404), `DONOR_EXISTS` (409), `PHONE_MISMATCH` (403), `VALIDATION` (422).

Every list accepts `page`, `limit`, `search` plus the filters listed. Phones are sent as `01XXXXXXXXX` (Latin digits). Dates are ISO-8601.

## Reference data

| Method & path | Returns / notes |
|---|---|
| `GET /weather` | `Weather` — current reading + 3-day forecast |
| `GET /services/popular` | `string[]` of service slugs by all-time views |
| `GET /search?q=` | `SearchHit[]` `{ kind: doctor\|directory\|institution\|job, id, title, subtitle, href }` |
| `GET /area/profile` · `/area/unions` · `/area/administration` · `/area/municipality` | `AreaProfile`, `Union[]`, `Administration`, `Municipality` |

## Health

| Method & path | Notes |
|---|---|
| `GET /doctors?specialty&today=true` | Paginated `Doctor`. `sittingToday` is computed server-side from chamber days (0 = Sunday … 6 = Saturday). |
| `GET /doctors/stats` | `{ total, sittingToday, specialties: [{ name, count }] }` |
| `GET /doctors/:id` | `Doctor` |
| `POST /doctors` | Submission → `{ id, status: "pending" }`; published after admin review. Body: `name, specialty, degrees[], phone, chambers[{ hospital, days[], time, serial?, fee? }]` |
| `GET /donors?group&status=ready\|not-yet\|unknown` | Paginated `Donor`; ready = ≥ 120 days since `lastDonation`. Ready donors first. |
| `GET /donors/stats` | `{ total, byGroup: { "A+": n … }, ready, notYet, unknown }` |
| `POST /donors` | Register; 409 `DONOR_EXISTS` on duplicate phone |
| `PATCH /donors/:id/last-donation` | `{ phone, lastDonation }`; `phone` must match the registered number (403 `PHONE_MISMATCH`) |

## Directories

| Method & path | Notes |
|---|---|
| `GET /directory/:type` | Paginated `DirectoryEntry` `{ id, type, name, role?, phone?, whatsapp?, address?, hours?, description?, photo?, verified?, rating?, ratingCount?, mapUrl? }`. Types: see `DIRECTORY_TYPES` in `features/directory/schemas`. |
| `POST /directory/:type` | “Add your info” submission → pending |
| `POST /directory/:type/:id/rate` | `{ stars: 1–5 }` → updated entry |

## Accounts: social sign-in only

There is no password, PIN or sign-up endpoint. A person signs in with **Google, Facebook or Apple**; the first successful sign-in creates the account.

| Method & path | Notes |
|---|---|
| `GET /auth/:provider?returnTo=/path` | Browser navigation, not XHR. `provider` = `google` \| `facebook` \| `apple`. Start the OAuth 2.0 / OpenID Connect flow with `state` + PKCE and redirect to the provider. Keep `returnTo` only if it is a same-site path (starts with `/`, not `//`). |
| `GET\|POST /auth/:provider/callback` | Provider redirect URI (Apple uses `form_post`). Verify `state` and the ID token, then upsert the user by `(provider, providerUserId)`; if the provider gives a **verified** email that matches an existing user, link to that user instead of creating a second one. Set the refresh token as an httpOnly, `Secure`, `SameSite=Lax` cookie (`None` only if the API is on an unrelated domain) and `302` to `NEXT_PUBLIC_APP_URL + returnTo`. On failure `302` to `/?authError=cancelled\|email_required\|provider_error`. |
| `POST /auth/refresh` | Uses the cookie. → `{ accessToken, user }` where `user` = `{ id, name, email \| null, avatar \| null, provider }`. Rotate the refresh token. 401 `NO_SESSION` when signed out. |
| `POST /auth/logout` | Revokes the refresh token and clears the cookie. |
| `GET /me/posts` | Auth required. The caller's community posts across all kinds, newest first, excluding deleted: `MyPost[]` `{ kind: job\|listing\|rental\|vehicle\|tuition, id, title, status, createdAt, href }`. `href` is where the post is seen on the site (e.g. `/jobs/:id`, `/to-let`). |

Authenticated calls send `Authorization: Bearer <accessToken>`. Missing / expired token → 401 `UNAUTHENTICATED` (the client refreshes once and retries).

Provider notes: Apple returns the user's name only on the very first sign-in, so store it then; Apple and Facebook may withhold email (keep `email` nullable). Facebook needs the app in Live mode with `email` + `public_profile` permissions.

## Community posts (signed-in posting, owner-managed)

Same shape for `/jobs`, `/listings` (buy & sell), `/rentals` (to-let), `/vehicles` (car rent), `/tuitions`. Every post carries `ownerId` (the poster's user id).

| Method & path | Notes |
|---|---|
| `GET {base}` | Public. Active posts, newest first. Filters: listings `category`, rentals `type`, vehicles `type`, tuitions `kind`. Sold listings and rented rentals stay listed with their status; filled jobs and closed tuition posts drop off. |
| `GET {base}/:id` | Public. One post |
| `POST {base}` | **Auth required** (401 `UNAUTHENTICATED`). Server sets `ownerId` from the token; never accept it from the body. Body includes `images[]` (URLs from `/uploads`) and `durationDays` where the post auto-expires (jobs 7/15/20/30, rentals 30, tuitions 30). Honeypot field `website` is stripped client-side; reject if present. Rate-limit per user. |
| `PATCH {base}/:id` | **Owner only** (403 `NOT_OWNER`). Edit |
| `POST {base}/:id/manage` | **Owner only** (403 `NOT_OWNER`). `{ action: "delete" \| "mark-done" }` |
| `POST {base}/:id/report` | Public. `{ reason: fake\|sold\|wrong-info\|other, note? }` |

Featured / verified flags are admin-only and never accepted from these endpoints.

## Workers, education, uploads

| Method & path | Notes |
|---|---|
| `GET /workers?trade` · `POST /workers` | Skilled-worker list / self-registration `{ name, phone, trades[], address? }` |
| `GET /institutions?type` · `GET /institutions/:id` · `POST /institutions` | List (with `lat`, `lng` for the map), detail, add (pending) |
| `POST /institutions/:id/claims` | `{ name, role, phone, email?, proof }` → pending |
| `GET /notices?institution&limit` | Paginated `Notice`, newest first |
| `POST /uploads` | multipart, field `files` (≤ 5 images, ≤ 5 MB each) → `{ urls: string[] }` |
