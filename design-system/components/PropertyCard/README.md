# PropertyCard

The listing summary used in every result list, carousel and saved list.

- Props: `title`, `location`, `price`, `currency`, `period` (default `month`), `originalPrice`, `beds` (0 = Studio), `baths`, `area`, `areaUnit` (default m²), `rating`, `reviews`, `badges` (`[{label, tone, icon}]`, max 2), `image`, `imageAlt`, `kind` (placeholder style), `photoCount`, `availableFrom`, `saved` / `defaultSaved`, `onSaveChange` (pass `null` to hide the heart), `href`, `layout` (`vertical` · `horizontal` · `boxed`), `footer`.
- `vertical` in ListingGrid; `horizontal` beside a map and in dashboards (it stacks on phones); `boxed` in carousels on tinted bands.
- The whole card is one link (the title's); the heart is a separate control above it.
- Photo is 4:3 with `radius-lg`. Title one line, truncated. Lead with what renters filter on: price, beds, baths, area.
