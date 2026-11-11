EasyRentSpot helps people find a home to rent and helps landlords fill it. The interface should feel calm, trustworthy and quick: a bright neutral canvas, one confident green (Spruce) for action, and coral used sparingly for the moments that matter: saves, deals and things that are new. Build every surface, from search to landlord dashboard, from the tokens and components below so the product stays consistent as it grows into short stays, rooms, commercial or equipment rental.

## Principles

- **Price and place first.** Every listing surface leads with what renters filter on: price with its period, location, beds, baths and size. Use `Price`, never hand-formatted numbers.
- **Show the whole cost.** Rent, deposit and fees appear before any “Request” button (`BookingPanel`). No surprises at checkout.
- **Trust is visible.** Verification, response times and real reviews sit next to the decision (`HostCard`, `Badge tone="success"`, `Rating`). Only show a trust signal when it has really been checked.
- **Mobile first, always.** Design at 375px, then enhance. Thumb-reachable actions (`StickyActionBar`, `BottomNav`), 44px touch targets (`tap-min`), sheets instead of popups.
- **One system, any rental.** New verticals reuse the same components with different data: a parking space is a `PropertyCard` with other specs; an equipment hire uses the same `BookingPanel`.

## Content fundamentals

- **Voice:** friendly, plain, direct. Speak to the renter as “you”; EasyRentSpot speaks as “we”. Landlords are “landlords” (or “property managers” for agencies), never “hosts” on long-term rentals.
- **Casing:** sentence case everywhere: titles, buttons, tabs, badges (“Request to rent”, “Pets allowed”). Uppercase only in `overline` eyebrows and table headers.
- **Buttons are verbs:** “Request to rent”, “Message landlord”, “Save search”, “Show 248 homes”. Never “Submit” or “Click here”.
- **Numbers:** currency with symbol, no cents (`$2,450 / month`). Dates as “1 Mar” in compact UI and “1 March 2027” in sentences. Areas as `78 m²` (or `840 sq ft` per market, via `areaUnit`).
- **Errors say what to do:** “Enter a move-in date after today”, not “Invalid date”. Empty states explain why and offer the next step.
- **No emoji** in UI copy. No exclamation marks except in a landlord's own words.
- Real examples: “Sunny 2-bed loft near the river” · “Available 1 Mar” · “You won't be charged until the landlord accepts” · “Sofia usually replies within an hour.”

## Colour

- **Surfaces:** pages sit on `canvas`; cards, inputs, navbar and sheets on `surface`; menus, toasts and modals on `surface-raised` with a shadow; alternating bands, table headers and empty tracks use `surface-sunken`.
- **Text:** `ink` for primary text and headings, `ink-muted` for secondary text and metadata, `ink-subtle` for placeholders and captions. All three read at 4.5:1 or more on `canvas` and `surface` in both themes.
- **Brand:** `brand` (Spruce) is the action colour: primary buttons, links, selected states, active nav. Text on it is `on-brand`. Hover and press use `brand-strong`; tinted selections use `brand-soft`.
- **Accent:** `accent` (Coral) for saved hearts, “New”, “Price drop” and promotions. At most one accent moment per card. Text on it is `on-accent`.
- **Status:** `success`, `warning`, `danger` and `info`, each with a `-soft` background. Status colour never stands alone: always pair it with an icon or a word (the `Badge` and `Alert` components do this).
- **Lines:** `line` for decorative hairlines and card borders; `line-strong` for anything a person must find: input, checkbox and secondary-button borders (3:1).
- **Rating stars** use `rating`. Map placeholders use `map-land` and `map-water`. Scrims use `overlay`.
- **Dark theme** is a full theme, not an inversion: the brand and accent lighten, so text on them turns dark through `on-brand` / `on-accent`. Never hard-code white on a brand fill.

## Typography

- Three families: **Bricolage Grotesque** (`display`) for big headlines and the wordmark; **Plus Jakarta Sans** (`sans`) for everything else; **JetBrains Mono** (`mono`) only for references and IDs (`code`). All three are hosted on Google Fonts and loaded by `components/bundle.css`.
- Use the named styles: `display-xl` (home hero), `display-lg` (city and landing titles), `h1` (listing title, dashboard page title), `h2` (page sections), `h3` (cards, modals), `h4` (sub-sections, card titles), `body-lg` (descriptions), `body` (default), `body-sm` (metadata), `label` (form labels, buttons, tabs), `caption` (badges, timestamps), `overline` (eyebrows).
- Prices use `price-lg` / `price`: heavy weight, tabular numerals.
- **Responsive scale:** styles are set for phones. From lg (1024px) step up `display-xl` to 64/68, `display-lg` to 44/50, `h1` to 32/40, `h2` to 24/32. Body sizes never change.
- Inputs use 16px text below md so iOS doesn't zoom on focus.

## Layout and responsiveness

- **Breakpoints (min-width):** `bp-sm` 640 · `bp-md` 768 · `bp-lg` 1024 · `bp-xl` 1280 · `bp-2xl` 1536. Write base CSS for phones, then layer up. Never write max-width queries.
- **Gutters:** 16px (`space-4`) on phones, 24px (`space-6`) from md, 32px (`space-8`) from lg, all handled by `Container`. Content caps at `container-max` (1280px); forms, checkout and articles use `container-narrow` (760px).
- **Listing grid:** `ListingGrid` gives 1 → 2 (sm) → 3 (lg) → 4 (xl, opt-in) columns, with gaps of `space-4` / `space-6`.
- **Page rhythm:** sections are `space-8` apart on phones, `space-12` on tablet and `space-16` on desktop. Inside cards, stack with `space-3` to `space-5`.
- **What changes at each step:**
  - *Phone (<768):* `BottomNav` + `Navbar` menu drawer, `SearchBar` stacked, `Gallery` swipe carousel, `Modal` as bottom sheet, `DataTable` as stacked cards, `StickyActionBar` for the listing CTA, `Breadcrumbs` collapsed to a back link.
  - *Tablet (768–1023):* SearchBar becomes one pill row, centred dialogs, Gallery mosaic, real tables, numbered pagination, horizontal `Steps`.
  - *Laptop (1024+):* full Navbar replaces BottomNav, listing page splits into content + sticky `BookingPanel`, `StickyActionBar` hides.
  - *Desktop (1280+):* 4-column grids, list + map split view on search results.
- **Spacing** comes from the 4px scale only (`space-0-5` … `space-20`). Never use values off the scale.

## Shape, depth and motion

- **Radii:** `radius-sm` for small controls, `radius-md` for buttons, inputs and alerts, `radius-lg` for cards and photos, `radius-xl` for modals, sheets, the gallery and the hero search, `radius-full` for chips, badges, avatars, pins and segmented controls.
- **Shadows** lift, they don't decorate: `shadow-xs` inputs, `shadow-sm` resting cards and navbar, `shadow-md` hovered cards, search and pins, `shadow-lg` menus, toasts and the booking panel, `shadow-xl` modals. Resting cards prefer a `line` border to a shadow.
- **Layers:** `z-sticky` < `z-dropdown` < `z-overlay` < `z-modal` < `z-toast`.
- **Motion** is short and functional: 150ms for hover and colour, 200–250ms for sheets, dialogs and toasts, ease-out. Everything honours `prefers-reduced-motion`.

## States and accessibility

- **Focus:** every interactive element shows a solid 2px `focus` ring with a 2px offset (3:1 on every surface in both themes). Never remove it.
- **Hover** darkens fills to `brand-strong` or tints neutrals with `surface-sunken`. **Selected** uses `brand-soft` with a `brand` border. **Disabled** is 45% opacity with a not-allowed cursor; prefer explaining why over disabling.
- **Errors:** `danger` border plus a message with an alert icon under the field, linked via `aria-describedby`.
- Touch targets are at least 44px (`tap-min`). Icon-only buttons always carry a `label`.
- Text contrast is 4.5:1 minimum (3:1 for 24px+). Status is never shown by colour alone.

## Imagery

- Listing photos are 4:3 with `radius-lg` (cards) or a `radius-xl` mosaic (detail page). Bright, level, daylight shots; the first photo is the living space or the facade.
- Missing photos show `ImagePlaceholder`, a flat token-coloured house illustration. It is for drafts and loading only, never for a published listing.
- Avatars are real faces, cropped square, shown round. Initials on `brand-soft` when there is no photo.

## Iconography

- One line-icon set lives in the bundle (`ERS.Icon`, list in `ERS.Icon.names`): 24px grid, 1.75px round stroke, `currentColor`. Filled variants (`heart-fill`, `star-fill`) are only for on-states.
- Sizes: 16 in specs, chips and badges; 18–20 in buttons and fields; 22–24 in amenity lists and the bottom bar.
- The set was drawn for this system (there was no existing icon library). Add new glyphs in the same style rather than mixing in another library.
- No emoji as icons.

## Logo

- There is no logo mark yet. The `Logo` component sets the name as a wordmark in the display face: “EasyRent” in `ink`, “Spot” in `brand`, a full stop in `accent`. Replace it when a real mark is designed; until then, don't draw one.

## Components at a glance

- **Foundations:** Icon, Logo
- **Actions:** Button, IconButton, FavoriteButton
- **Forms:** TextField, Select, Textarea, Checkbox, RadioGroup, Switch, Stepper, SegmentedControl, RangeSlider, Chip, SearchBar, FileDrop
- **Navigation:** Navbar, BottomNav, Tabs, Breadcrumbs, Pagination, Footer
- **Layout:** Container, ListingGrid, SectionHeader, Card
- **Listings:** PropertyCard, Gallery, KeyFacts, AmenityList, MapPin, ImagePlaceholder
- **Booking:** BookingPanel, StickyActionBar, Calendar, HostCard, ReviewCard
- **Messaging:** MessageThread
- **Feedback & overlays:** Alert, Toast, Modal, Menu, Tooltip, Progress, Spinner, Steps, Skeleton, EmptyState, Accordion
- **Dashboard:** StatCard, DataTable

## Page recipes

- **Home:** Navbar → hero (`display-xl` + hero `SearchBar` on `canvas`) → `SectionHeader` + `ListingGrid` of `PropertyCard` → trust band on `surface-sunken` → Footer. BottomNav on phones.
- **Search results:** compact `SearchBar` (phone) or hero SearchBar (md+) → Chip row → result count + sort `Menu` + List/Map `SegmentedControl` → `ListingGrid` or, from xl, list of horizontal PropertyCards beside a map of `MapPin`s → `Pagination`. Filters open in a `Modal`.
- **Listing detail:** `Breadcrumbs` → `Gallery` → `h1` title, Rating, location → `KeyFacts` → description (`body-lg`) → `AmenityList` → `Calendar` availability → `ReviewCard`s → `HostCard` → `Accordion` (rules and FAQs). From lg, a sticky `BookingPanel` in the right column; below lg, a `StickyActionBar`.
- **Apply / checkout:** `Container size="narrow"` → `Steps` → form fields in a `Card` → `FileDrop` for documents → summary → primary Button.
- **Landlord dashboard:** Navbar → `h1` + `Tabs` → `StatCard` row → `Alert` for anything overdue → `DataTable` of properties, tenants or payments → `EmptyState` when a list is empty.
- **Inbox:** list of conversations (Avatar + name + last message) and a `MessageThread`; on phones the thread is full-screen with a back button.
