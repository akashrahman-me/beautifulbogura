# BookingPanel

The rent / apply box on a listing page: price, move-in, lease length, cost breakdown and the main CTA.

- Props: `price`, `currency`, `period`, `rating`, `reviews`, `availability`, `moveIn`, `leaseOptions`, `defaultLease`, `deposit`, `fees` (`[{label, amount}]`), `totalLabel`, `ctaLabel`, `secondaryLabel`, `note`, `onRequest`, `onMessage`, `sticky`.
- Show every cost before the CTA; the total is computed from rent + deposit + fees. No hidden fees, ever.
- From lg it sits in the right column with `sticky`; below lg, hide it in the flow and use StickyActionBar to open it as a Modal sheet.
