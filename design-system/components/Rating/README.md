# Rating

Average review score out of five, in `rating` amber.

- Props: `value`, `count`, `variant` (`compact` default — one star, value and count · `stars` — five stars), `showValue`, `size` (`sm` · `md`).
- Use compact on PropertyCard and BookingPanel; five stars only inside a ReviewCard.
- Always show one decimal (4.0, not 4). Hide the rating entirely below three reviews and show a “New” Badge instead.
