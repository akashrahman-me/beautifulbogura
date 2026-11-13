# Console — the admin dashboard for বিউটিফুল বগুড়া

> Status: frontend built in `console/` (all modules below, running on an in-browser demo API). Backend endpoints: `console/API_CONTRACT.md`.

`client/` is the public portal. `console/` is a separate Next.js app for the people who run it:
the site owner, moderators and data editors. Same stack and architecture as the client
(Next.js 16 · React 19 · TanStack Query · nuqs · Zustand · React Hook Form + Zod · Tailwind v4 with the
design-system tokens and `bb-*` components), its own deploy (e.g. `console.example.com`), `noindex`.

The backend does not exist yet. The console talks to `/admin/*` endpoints described in
`console/API_CONTRACT.md`; until they exist it runs on an in-browser fake (`NEXT_PUBLIC_DATA_MODE=demo`),
exactly like the client.

---

## 1. Who uses it — roles and permissions

Staff sign in with the same social providers as the public site (Google / Facebook / Apple). An account
becomes staff only when an admin gives it a role. Anyone else who signs in sees “এই অ্যাকাউন্টে কনসোলের অনুমতি নেই”.

| Permission | প্রশাসক (admin) | মডারেটর (moderator) | সম্পাদক (editor) |
|---|:-:|:-:|:-:|
| `dashboard.view` — overview | ✓ | ✓ | ✓ |
| `review.manage` — approve / reject submissions | ✓ | ✓ | ✓ |
| `reports.manage` — handle reports | ✓ | ✓ | |
| `posts.manage` — community posts (feature, verify, extend, remove) | ✓ | ✓ | |
| `users.manage` — ban / unban public users | ✓ | ✓ | |
| `content.manage` — directories, doctors, donors, workers, institutions, area, people lists, videos | ✓ | | ✓ |
| `announcements.manage` — home slides, site notice, push notifications | ✓ | | ✓ |
| `voters.manage` — voter roll import / search | ✓ | | |
| `staff.manage` — invite staff, change roles | ✓ | | |
| `settings.manage` — site settings | ✓ | | |
| `audit.view` — audit log | ✓ | ✓ | |

The UI hides what a role cannot do (nav items, buttons); the API enforces it (403 `FORBIDDEN`).
Every write is recorded in the audit log with who, what, when and the reason given.

## 2. Modules (navigation)

Sidebar groups, in order. Counts on নিরীক্ষা and রিপোর্ট are live badges.

**সারসংক্ষেপ**
- `/` ড্যাশবোর্ড — KPIs, 30-day activity chart, what needs attention, recent activity.

**মডারেশন**
- `/review` যাচাইয়ের অপেক্ষায় — doctors, directory entries, institutions and institution claims
  submitted by the public. Split view (queue | detail), approve, edit-then-approve, reject with a reason
  the submitter will see. Keyboard: J / K next / previous, A approve, R reject.
- `/reports` রিপোর্ট — reports on community posts, grouped per post (reasons, count, notes, first/last
  report). Actions: dismiss, remove post, remove + ban owner. Auto-hidden posts (≥ N reports, see settings)
  are flagged.

**কমিউনিটি**
- `/posts` পোস্ট — jobs, buy & sell, to-let, car rent, tuition, matrimonial in one table with a kind
  filter. Status (active / done / expired / removed), featured, verified, owner, reports, expiry.
  Actions: feature / unfeature, verify / unverify, extend expiry, remove (reason), restore.
- `/users` ব্যবহারকারী — public accounts: provider, joined, posts, reports against them, status.
  Detail sheet: their posts, ban (reason; blocks posting, hides their posts) / unban.

**তথ্যভান্ডার** (content editors)
- `/directory` তালিকা — all 26 directory types, CRUD, verified / rating, hidden.
- `/doctors` ডাক্তার — CRUD with chambers (hospital, days, time, serial, fee).
- `/donors` রক্তদাতা — edit, last donation date, remove on request.
- `/workers` কারিগর — edit trades, remove.
- `/institutions` শিক্ষা প্রতিষ্ঠান — CRUD, notices per institution, claimed-by.
- `/area` উপজেলা পরিচিতি — profile (summary, stats, accordion sections), unions, administration, municipality.

**মানুষ**
- `/people/freedom-fighters` মুক্তিযোদ্ধা · `/people/notable` বিশিষ্ট ব্যক্তি (biography editor) ·
  `/people/achievers` কৃতি সন্তান · `/voters` ভোটার তালিকা (admin: CSV import, per-union counts; every
  search is audited).

**প্রচার**
- `/announcements` ঘোষণা — home hero slides (order, tone, eyebrow, title, body, CTA, schedule),
  site-wide notice bar (e.g. flood warning, with severity and expiry), push notifications (title, body,
  link) with a send history.
- `/videos` ভিডিও — YouTube id, title, category, duration, publish.

**ব্যবস্থাপনা**
- `/staff` স্টাফ — staff list, invite by email with a role, change role, remove.
- `/audit` অডিট লগ — filter by person, action, resource, date.
- `/settings` সেটিংস — contact (admin phone, email), social links, posting rules (post lifetimes per
  kind, max photos, posts per user per day), moderation (auto-hide after N reports).

Also: `/login`, account menu (profile, theme, sign out), ⌘K command palette (jump to any page; search
posts, users, doctors, directory), 404 / error pages.

## 3. UX — how it is laid out

The design system was drawn for a phone-first public site. The console keeps its tokens, type, components,
voice and rules, and adds an operator's layout for long sessions at a desk, still usable on a phone.

- **Shell:** from `lg` a left sidebar (264px, collapsible to 72px icons, remembered) on `surface`, a top bar
  with page title, ⌘K search, theme toggle and account menu. Below `lg` the sidebar becomes a drawer.
- **Tables first:** lists are tables from `md` (cards below), rows ≥ 48px (`tap-min`), sticky header,
  `surface` with `line` borders, hover `surface-sunken`. Checkbox selection, and a bulk-action bar
  appears for the selection. Server-side pagination, sort and filters; all of them live in the URL (nuqs),
  so a filtered view can be shared or bookmarked.
- **Edit in place:** create / edit / detail open in a right-hand sheet (`surface-raised`, `shadow-xl`,
  full-screen below `md`) so the list keeps its scroll and filters. Unsaved changes warn before closing.
- **Reasons for consequences:** rejecting, removing and banning ask for a reason (chips for common ones +
  free text). Removals are soft; a toast offers “ফিরিয়ে আনুন” (undo). Destructive buttons use `emergency`;
  nothing else is red.
- **Status in words:** every state is a `Badge` with a word (অপেক্ষমাণ, প্রকাশিত, বাতিল, মুছে ফেলা, নিষিদ্ধ,
  মেয়াদ শেষ…), never colour alone.
- **Bangla first:** all copy Bangla, numerals through `bn()`, dates “১২ জুলাই ২০২৬”, relative “২ ঘণ্টা আগে”.
  Buttons are verbs (“অনুমোদন দিন”, “বাতিল করুন”, “সংরক্ষণ করুন”).
- **Loading / empty / error:** skeletons shaped like the table, empty states with the brick motif and the
  next action, errors with a retry. No spinners except inside buttons.
- **Focus and keyboard:** visible focus everywhere, shortcuts listed in the palette, Esc closes sheets.
- **Demo mode:** a role switcher in the account menu (admin / moderator / editor) to try each role.

## 4. Architecture

```
console/
  src/app/                 routes only; (console) group = signed-in shell, /login outside it
  src/features/<module>/   schemas → api → hooks → components, imported through index.ts
  src/components/ui/       design-system primitives (copied from client — see §6)
  src/components/admin/    DataTable, Sheet, ConfirmDialog, ReasonDialog, PageHeader, StatusBadge,
                           FormFields, Toolbar, BulkBar, CommandPalette, Chart
  src/lib/                 api-client (envelope, ApiError, refresh, demo transport), resource.ts
                           (generic CRUD api + hooks), permissions.ts, query-client, utils, theme
  src/stores/              session (user + role), ui (sidebar collapsed)
  src/mocks/               demo admin API + seed data
```

- `createResource(base)` gives list / get / create / update / remove and `useList / useOne / useSave /
  useRemove` with cache invalidation and toasts, so each content module is schema + columns + form.
- Optimistic updates for toggles (feature, verify); everything else waits for the server.
- `Can` / `useCan(permission)` gate UI; `RequirePermission` gates a page.

## 5. What the client needs afterwards (not in this change)

- Home slides and the site notice should come from `GET /home/slides` and `GET /site/notice` instead of
  the hard-coded `SLIDES` in `client/src/features/home/components/HomeWidgets.tsx`.
- Contact phone, social links and post lifetimes should come from `GET /site/settings` instead of
  `client/src/config/services.ts`.
- Rejected / removed reasons should show to the submitter (account page).

## 6. Shared code

The console copies the design-system layer from the client (`styles/tokens.css`, `styles/components.css`,
`components/ui/*`, `lib/utils.ts`, `lib/theme.ts`). Once both apps are stable, move these into a workspace
package (`packages/ui`) so a token change lands in both at once.
