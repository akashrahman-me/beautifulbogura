# Icon

Line icons on a 24px grid with a 1.75px round stroke; `currentColor` inherits the text colour around them.

- Props: `name` (see `ERS.Icon.names`), `size` (default 20), `label` (only when the icon stands alone and carries meaning — otherwise it is hidden from screen readers), `strokeWidth`.
- Sizes: 16 inside chips, specs and badges; 18–20 in buttons and fields; 22–24 in amenity lists and BottomNav.
- Use `heart-fill` / `star-fill` for the on-state of saves and ratings.
- Do not mix in another icon family; if a glyph is missing, add it to the set at the same stroke and grid.
