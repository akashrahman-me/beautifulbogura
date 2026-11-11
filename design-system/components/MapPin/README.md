# MapPin

Price markers on the results map, plus cluster markers.

- Props: `price`, `currency`, `active` (the hovered or selected listing — inverts to `ink`), `visited`, `saved` (adds a heart), `count` (renders a cluster), `onClick`, `style` (for absolute positioning on your map).
- Sync `active` with hover on the matching PropertyCard in the list.
- The consumer provides the map; pins are plain buttons you position on it.
