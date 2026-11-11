# Button

The single action component for every click that does something; one `primary` per view, for the thing the page is for.

- Props: `variant` (`primary` · `secondary` · `ghost` · `accent` · `danger` · `link`), `size` (`sm` 36px · `md` 44px · `lg` 52px), `iconLeft`, `iconRight`, `block`, `loading`, `href` (renders an anchor), plus native button props.
- Labels are verbs in sentence case: “Request to rent”, “Message landlord”, “Save search”. No ALL CAPS, no trailing punctuation.
- `md` is the default and meets the 44px touch target; use `lg` for the main CTA on mobile (BookingPanel, StickyActionBar, SearchBar) and `block` inside narrow cards and sheets.
- `accent` is reserved for promotional moments (e.g. “Boost listing”); `danger` only for destructive actions, ideally confirmed in a Modal.
- `loading` keeps the width and shows a spinner; don't swap the label for “Loading…”.
