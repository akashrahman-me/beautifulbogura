# API contract expected by the web client

Base: `NEXT_PUBLIC_API_URL` (e.g. `https://api.example.com/api/v1`). JSON in and out.
`src/mocks/demo-server.ts` implements every endpoint below in the browser and is the reference behaviour.
Types live in each feature's `schemas/*.schema.ts`.

## Envelope

```jsonc
// success
{ "success": true, "message": "OK", "data": <T>, "meta": { "page": 1, "limit": 12, "total": 40, "totalPages": 4 } }
// failure — switch on `code`, never on `message`; `errors[].path` maps onto form fields
{ "success": false, "message": "পিন মেলেনি", "code": "INVALID_PIN", "errors": [{ "path": "pin", "message": "পিন মেলেনি" }] }
```

`meta` is present on list endpoints. Messages are shown to users, so write them in Bangla.
Codes the client handles specially: `INVALID_PIN` (403), `NOT_FOUND` (404), `DONOR_EXISTS` (409), `PHONE_MISMATCH` (403), `VALIDATION` (422).

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

## Community posts (no accounts, PIN-managed)

Same shape for `/jobs`, `/listings` (buy & sell), `/rentals` (to-let), `/vehicles` (car rent), `/tuitions`:

| Method & path | Notes |
|---|---|
| `GET {base}` | Active posts, newest first. Filters: listings `category`, rentals `type`, vehicles `type`, tuitions `kind`. Sold listings and rented rentals stay listed with their status; filled jobs and closed tuition posts drop off. |
| `GET {base}/:id` | One post |
| `POST {base}` | Create. Body includes `pin` (4–6 digits, store hashed), `images[]` (URLs from `/uploads`), and `durationDays` where the post auto-expires (jobs 7/15/20/30, rentals 30, tuitions 30). Honeypot field `website` is stripped client-side; reject if present. |
| `PATCH {base}/:id` | Edit; body includes `pin` |
| `POST {base}/:id/manage` | `{ pin, action: "delete" \| "mark-done" }`; 403 `INVALID_PIN` on mismatch. Rate-limit this. |
| `POST {base}/:id/report` | `{ reason: fake\|sold\|wrong-info\|other, note? }` |

Featured / verified flags are admin-only and never accepted from these endpoints.

## Workers, education, uploads

| Method & path | Notes |
|---|---|
| `GET /workers?trade` · `POST /workers` | Skilled-worker list / self-registration `{ name, phone, trades[], address? }` |
| `GET /institutions?type` · `GET /institutions/:id` · `POST /institutions` | List (with `lat`, `lng` for the map), detail, add (pending) |
| `POST /institutions/:id/claims` | `{ name, role, phone, email?, proof }` → pending |
| `GET /notices?institution&limit` | Paginated `Notice`, newest first |
| `POST /uploads` | multipart, field `files` (≤ 5 images, ≤ 5 MB each) → `{ urls: string[] }` |
| `POST /auth/refresh` | Reserved for the admin area; the public portal works without a session |
