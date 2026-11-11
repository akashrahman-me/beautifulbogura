# Price

A formatted rent amount with its period — the most important number on every listing.

- Props: `amount` (number, formatted with `Intl`), `currency` (default `USD`), `locale`, `period` (`month` · `week` · `night` · `year` · custom string · `null`), `size` (`sm` · `md` · `lg`), `original` (shows a struck-through previous price), `note`.
- Always show the period. Never round to “$2.4k” in listings; whole units, no cents.
- `lg` in BookingPanel and the listing header, `md` on PropertyCard, `sm` in tables and map tooltips.
