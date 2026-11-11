# Toast

A brief confirmation after an action, bottom-centre on phones and bottom-right from md.

- Props: `tone` (`neutral` · `success` · `danger` · `brand`), `title`, `children`, `icon`, `actionLabel` + `onAction` (e.g. Undo), `onDismiss`.
- Stack in `.ers-toasts`. Auto-dismiss after 5 s unless it has an action; never use for errors that block progress (use Alert).
