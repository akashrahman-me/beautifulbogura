# StatCard

A KPI tile for landlord and agency dashboards.

- Props: `label`, `value` (pre-formatted string), `delta` (“+12%”; its sign sets the arrow unless `trend` is passed), `trend` (`up` · `down` · `flat`), `positive` (`up` default · `down` — which direction is good; sets green vs red), `hint` (“vs last month”), `icon`.
- Four across from lg, two on tablets, one per row on phones (or a horizontal scroller).
- Up is not always good: pass `positive: 'down'` for overdue rent, vacancy or days-to-let so a drop shows green.
