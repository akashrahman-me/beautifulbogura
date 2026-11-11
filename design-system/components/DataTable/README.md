# DataTable

Tabular records — properties, tenants, payments — that turn into stacked cards on phones.

- Props: `columns` (`[{key, label, align, render(row)}]`; the first column is the row title), `rows`, `rowKey`, `caption`, `footer` (e.g. Pagination).
- Below md each row becomes a card with “Label · value” lines; from md it is a normal table with uppercase headers.
- Status cells use Badge; money right-aligned with tabular numerals.
