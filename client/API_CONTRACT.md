# API contract expected by the web client

Base: `NEXT_PUBLIC_API_URL` (local: `http://localhost:4000/api/v1`). JSON in and out.
The server is `cloud/` (Express + MongoDB). Its live OpenAPI document is at `http://localhost:4000/api/docs`
(development) and is generated from the same route table, so it is the final word when this file and the
code disagree. `src/mocks/demo-server.ts` still implements every endpoint in the browser for
`NEXT_PUBLIC_DATA_MODE=demo`. Keep it in step when an endpoint changes.
Types live in each feature's `schemas/*.schema.ts`.

## Envelope

```jsonc
// success
{ "success": true, "message": "OK", "data": <T>, "meta": { "page": 1, "limit": 12, "total": 40, "totalPages": 4 } }
// failure — switch on `code`, never on `message`; `errors[].path` maps onto form fields
{ "success": false, "message": "ফোন নম্বর ঠিক নেই", "code": "VALIDATION_ERROR", "errors": [{ "path": "phone", "message": "১১ সংখ্যার মোবাইল নম্বর লিখুন" }] }
```

`meta` is present on list endpoints. Messages are shown to users, so write them in Bangla.
`DELETE` answers `204` with no body. Error codes:

| Status | Codes |
|---|---|
| 400 | `VALIDATION_ERROR` (with `errors[]`; `path` is the field name, e.g. `phone`, `chambers.0.time`), `INVALID_ID`, `BAD_JSON`, `UNSUPPORTED_FILE`, `STATE_INVALID` |
| 401 | `UNAUTHENTICATED` (no / bad token; the client refreshes once and retries), `TOKEN_EXPIRED`, `NO_SESSION` (refresh without a cookie), `SESSION_REVOKED` (a reused refresh token; sign in again) |
| 403 | `FORBIDDEN`, `NOT_OWNER`, `PHONE_MISMATCH`, `BANNED` (banned accounts cannot post), `NOT_ADDABLE` / `NOT_RATABLE` (directory type does not allow it) |
| 404 | `NOT_FOUND`, `ROUTE_NOT_FOUND` |
| 409 | `DONOR_EXISTS`, `WORKER_EXISTS`, `DUPLICATE_KEY`, `CONFLICT` |
| 413 | `PAYLOAD_TOO_LARGE` (photo over the size limit) |
| 429 | `RATE_LIMITED`, `POST_LIMIT` (posts per user per day, from site settings) |
| 503 | `MAINTENANCE` (posting paused in site settings), `WEATHER_UNAVAILABLE` |

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
| `GET\|POST /auth/:provider/callback` | Provider redirect URI (Apple uses `form_post`). Verify `state` and the ID token, then upsert the user by `(provider, providerUserId)`; if the provider gives a **verified** email that matches an existing user, link to that user instead of creating a second one. Set the refresh token as an httpOnly cookie `bb_rt` (path `/api/v1/auth`, `Secure` unless `COOKIE_SECURE=false` locally) and `303` to `CLIENT_URL + returnTo`. On failure `303` to `returnTo?authError=cancelled\|provider_error`. |
| `GET\|POST /auth/dev` | **Development only** (`AUTH_DEV_LOGIN=true`, refused in production). When a provider has no credentials, `/auth/:provider` sends the browser here instead: a local page to pick a seeded account or type a name and email, standing in for the provider. |
| `POST /auth/refresh` | Uses the cookie (send `credentials: "include"`). → `{ accessToken, user }` where `user` = `{ id, name, email \| null, avatar \| null, provider }`. Rotates the refresh token; replaying an old one revokes the whole session family (401 `SESSION_REVOKED`). 401 `NO_SESSION` when signed out. |
| `GET /auth/me` | Auth required. The signed-in account. |
| `POST /auth/logout` | Revokes the refresh token and clears the cookie. |
| `GET /me/posts` | Auth required. The caller's community posts across all kinds, newest first, excluding deleted: `MyPost[]` `{ kind: job\|listing\|rental\|vehicle\|tuition\|matrimony, id, title, status, createdAt, href }`. `href` is where the post is seen on the site (e.g. `/jobs/:id`, `/to-let`). |

Authenticated calls send `Authorization: Bearer <accessToken>`. Missing / expired token → 401 `UNAUTHENTICATED` (the client refreshes once and retries).

Provider notes: Apple returns the user's name only on the very first sign-in, so store it then; Apple and Facebook may withhold email (keep `email` nullable). Facebook needs the app in Live mode with `email` + `public_profile` permissions.

## Community posts (signed-in posting, owner-managed)

Same shape for `/jobs`, `/listings` (buy & sell), `/rentals` (to-let), `/vehicles` (car rent), `/tuitions`, `/matrimony` (marriage biodata). Every post carries `ownerId` (the poster's user id).

| Method & path | Notes |
|---|---|
| `GET {base}` | Public. Active posts, newest first. Filters: listings `category`, rentals `type`, vehicles `type`, tuitions `kind`. Sold listings and rented rentals stay listed with their status; filled jobs and closed tuition posts drop off. |
| `GET {base}/:id` | Public. One post |
| `POST {base}` | **Auth required** (401 `UNAUTHENTICATED`). Server sets `ownerId` from the token; never accept it from the body. Body includes `images[]` (URLs from `/uploads`) and `durationDays` where the post auto-expires (jobs 7/15/20/30, rentals 30, tuitions 30). Honeypot field `website` is stripped client-side; reject if present. Rate-limit per user. |
| `PATCH {base}/:id` | **Owner only** (403 `NOT_OWNER`). Edit |
| `POST {base}/:id/manage` | **Owner only** (403 `NOT_OWNER`). `{ action: "delete" \| "mark-done" }` |
| `POST {base}/:id/report` | Public. `{ reason: fake\|sold\|wrong-info\|other, note? }` |

Featured / verified flags are admin-only and never accepted from these endpoints.

## Matrimonial (`/matrimony`)

A community post (above): sign-in to create, owner-only manage, `mark-done` = “বিয়ে ঠিক হয়েছে” and drops the profile from the list.
`GET /matrimony?gender=bride|groom&religion&search` → paginated `Matrimonial` `{ id, ownerId, gender, name, birthYear, religion, maritalStatus, education, profession, familyMembers, preference, address, phone, whatsapp, photo, createdAt, status }`.
`POST /matrimony` body: the same fields minus server-set ones, `photo` as an `/uploads` URL or null. Reject when the age from `birthYear` is under the legal minimum (bride 18, groom 21) with 400 `VALIDATION_ERROR` on `birthYear`. Rate-limit per user; a confirmed fake profile should block the account.

## Public records & media

| Method & path | Notes |
|---|---|
| `GET /voters?union&search&dob&birthYear` | Paginated `Voter` `{ id, name, fatherName, motherName, voterNo, dob, gender, union, village, centre }`. **Requires** `search` (≥ 3 chars, name or voter no.) or `dob` (yyyy-mm-dd) or `birthYear`; otherwise 400 `VALIDATION_ERROR` on `search`, so the roll cannot be paged through. Rate-limit per IP. |
| `GET /freedom-fighters?union&search` | Paginated `FreedomFighter` `{ id, name, fatherName, idNo, village, union, sector \| null, alive, photo \| null }`; `meta.total` is shown as the count |
| `GET /achievers?cadre&search` | Paginated `Achiever` `{ id, name, cadre, batch \| null, post, workplace, village, union, photo \| null }`. Cadres: `admin, police, foreign, health, education, customs, tax, engineering, agriculture, judicial, other` |
| `GET /notable-persons?field&search` · `GET /notable-persons/:id` | List returns summaries `{ id, name, title, field, born, died, photo, excerpt }`; detail adds `body` (plain text, blank line between paragraphs). Fields: `politics, literature, education, liberation, sports, social` |
| `GET /videos?category&search` | Paginated `Video` `{ id, title, youtubeId, thumbnail \| null, category, duration (s), publishedAt }`, newest first. Categories: `tourism, history, food, news, culture` |

## Workers, education, uploads

| Method & path | Notes |
|---|---|
| `GET /workers?trade` · `POST /workers` | Skilled-worker list / self-registration `{ name, phone, trades[], address? }` |
| `GET /institutions?type` · `GET /institutions/:id` · `POST /institutions` | List (with `lat`, `lng` for the map), detail, add (pending) |
| `POST /institutions/:id/claims` | `{ name, role, phone, email?, proof }` → pending |
| `GET /notices?institution&limit` | Paginated `Notice`, newest first |
| `POST /uploads` | multipart, field `files` (≤ 5 images, ≤ 5 MB each) → `{ urls: string[] }` |

## Site, home and notifications

| Method & path | Notes |
|---|---|
| `GET /site/settings` | Public part of the console's settings: `{ contact: { adminPhone, email }, social: { facebook, whatsapp, telegram, tiktok, youtube }, posting: { jobDurations[], rentalDays, tuitionDays, vehicleDays, matrimonyDays, maxPhotos, postsPerDay }, maintenance: { enabled, message } }` |
| `GET /site/notice` | The site-wide notice bar `{ severity: info\|warning\|emergency, title, body, linkLabel, linkHref, expiresAt \| null }`, or `null` when off or expired |
| `GET /home/slides` | Home hero slides published and inside their schedule, in order |
| `POST /services/:slug/views` | `204`. Counts one open of a service tile (feeds `/services/popular`) |
| `GET /push/key` | VAPID public key, or `null` when push is not configured |
| `POST /push/subscriptions` · `DELETE /push/subscriptions` | Save / forget this browser's `PushSubscription` (`{ endpoint, keys: { p256dh, auth } }`) |

The site does not yet read `/home/slides`, `/site/notice` or `/site/settings`. It still uses the
hard-coded values (see `plans/console.md` §5).

