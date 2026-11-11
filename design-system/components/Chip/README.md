# Chip

Toggleable filter pills for quick filters on search results; removable chips show the filters currently applied.

- Props: `selected` / `defaultSelected`, `onChange(selected)`, `icon`, `count` (number of sub-filters set), `onRemove` (turns it into a removable “applied filter”).
- Lay them out in a horizontally scrolling row (`.ers-chiprow`) on mobile; they wrap from md up.
- Labels are nouns: “Pets allowed”, “Parking”, “Under $2,000”.
