# TextField

Labelled single-line input with hint, error and optional icon or suffix.

- Props: `label` (always visible — never rely on placeholder), `hint`, `error` (replaces hint, sets `aria-invalid`), `iconLeft`, `suffix` (units like “/ month”, “m²”), `optional`, plus all native input props (`type`, `value`, `placeholder`, `inputMode`…).
- Inputs are 48px tall and use 16px text on mobile so iOS doesn't zoom; 15px from md.
- Errors say what to do: “Enter a move-in date after today”, not “Invalid date”.
- Stack fields with `space-5` between them; two per row from md in forms.
