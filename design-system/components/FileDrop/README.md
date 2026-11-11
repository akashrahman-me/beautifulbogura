# FileDrop

Drag-and-drop or tap-to-choose upload for listing photos and tenant documents, with a file list.

- Props: `label`, `hint`, `accept`, `multiple`, `icon`, `onFiles(files)`, `files` (`{name, size, progress, status: 'uploading' | 'done' | 'error', error}`), `onRemove(index)`.
- The consumer owns uploading; feed progress back through `files`.
- State accepted types and the size limit in `hint`.
