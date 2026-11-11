# FavoriteButton

The heart that saves a listing; filled in `accent` when saved.

- Props: `saved` / `defaultSaved`, `onChange(saved)`, `size` (`sm` on cards, `md` on listing headers).
- It stops click propagation so it can sit on top of a linked PropertyCard.
- Confirm a save with a Toast (“Saved to Lisbon shortlist” + “Change” action), never a Modal.
