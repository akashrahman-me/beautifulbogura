# ImagePlaceholder

A token-coloured illustration shown when a listing has no photo yet, or while photos load.

- Props: `kind` (`house` · `apartment` · `townhouse` · `cabin`), `label` (alt text, default “Photo coming soon”).
- PropertyCard and Gallery use it automatically when `image` / `src` is missing. Never ship it in place of real photos on a published listing.
