# SearchBar

The rental search: location, move-in and property type with a primary Search action.

- Props: `variant` (`hero` default · `compact`), `defaultLocation`, `defaultMoveIn`, `types`, `ctaLabel`, `onSearch({location, moveIn, type})`; compact: `summary`, `onOpen`, `onFilters`.
- Hero stacks vertically on phones and becomes a single pill row from md (768px). Put it on the home hero and city landing pages.
- Compact is the sticky header on mobile results pages; tapping it opens the full search in a Modal sheet.
