---
name: ui-and-copy
description: Design-system, Bangla copy and UX rules for any visible change in client/ or console/ (components, pages, forms, empty/error/loading states, badges, buttons, colours, dark mode, wording). Use whenever you add or change UI or user-facing text.
---

# UI and copy rules

The project design system ("Beautiful Bogura", a claude.ai artifact linked from `client/README.md`) is
implemented in code. Code is the source of truth:

- `src/styles/tokens.css`: CSS variables, light + dark. Colours: `brand`, `accent`, `gold`, `info`,
  `success`, `warning`, `emergency` (each with `-soft` / `-strong` / `on-*`), surfaces `canvas`, `surface`,
  `surface-raised`, `surface-sunken`, ink `ink`, `ink-muted`, `ink-subtle`, lines `line`, `line-strong`; also
  spacing, radius, shadows, z-index, `tap-min`. Tailwind utilities map to them (`bg-surface`, `text-ink-muted`,
  `border-line`, `text-h2`…).
- `src/styles/components.css`: `bb-*` component classes (`bb-btn`, `bb-card`, `bb-badge`, `bb-chip`,
  `bb-alert`, `bb-dialog`, `bb-accordion`…). The console adds `src/styles/console.css` (shell, table, sheet, charts).
- `src/components/ui/`: React primitives over those classes: `Button`/`IconButton`, `Badge`, `Chip`/`FilterChips`,
  `Field`/`TextField`/`TextArea`/`Select`/`Checkbox`, `FileDrop`, `Icon`, `SearchField`, `ChoiceGroup`, `Rating`,
  `Accordion`, `Dialog`, `Tabs`/`SegmentedControl`, `Alert`, `Avatar`, `Bricks`, `Wordmark`, `MetaList`, `FormSteps`.

Use these before writing new markup. Never hard-code hex colours; use tokens. A design-system change goes into
both `client/` and `console/` (same files).

## Let the UI speak, not paragraphs

The user's standing rule: remove text that good UI/UX can carry. Use icons, layout, grouping, badges,
empty-state art and progressive disclosure instead of helper prose. **Do not shorten important phrases**:
legal notes, safety warnings, consequences, and labels that need their full meaning stay complete.

## Copy

- All user-facing text in **Bangla**. Numbers through `bn()` / `bnNumber()`, dates through `formatDate()`
  ("১২ জুলাই ২০২৬"), relative time like "২ ঘণ্টা আগে", money as ৳.
- Buttons are verbs: "অনুমোদন দিন", "বাতিল করুন", "সংরক্ষণ করুন", "পোস্ট করুন".
- Status is a word in a `Badge` (অপেক্ষমাণ, প্রকাশিত, বাতিল, মুছে ফেলা, নিষিদ্ধ, মেয়াদ শেষ…), never colour alone.
- Phones are entered and sent as `01XXXXXXXXX` (Latin digits accepted from Bangla input by `phoneField`).
- API error `message`s are shown as-is, so they are Bangla. Switch on `code`, never on the message.

## Colour and tone

- `emergency` (red) only for emergency services and destructive actions. Nothing else is red.
- `featured` / `verified` badges render only from API data (admin-granted).
- Dark mode: tokens switch with `<html data-theme="dark">` (`src/lib/theme.ts`). Check both themes.

## States and layout

- Every data view handles loading (a **skeleton** shaped like the content, never a spinner or "লোড হচ্ছে…"),
  error (`ErrorState` with retry), empty (`EmptyState` with the next action) and success.
- Spinners only inside a pressed button.
- Mobile first (site: bottom nav, thumb-reachable actions). Tap targets ≥ `tap-min` (48px).
  Visible focus everywhere.
- Console: tables from `md` (cards below), edit in a right-hand sheet (full screen on phones),
  Esc closes, unsaved changes warn.
- Contact actions: `ContactActions` / `PhoneLink` give call + WhatsApp + copy. Use them for every phone number.
