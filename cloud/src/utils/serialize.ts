/** Lean documents keep `_id` and `__v`; the API exposes `id`. Nested sub-documents are declared `_id: false`. */
export const withId = <T extends { _id?: unknown }>(doc: T | null): (Omit<T, '_id' | '__v'> & { id: string }) | null => {
  if (!doc) return null;
  const { _id, __v: _v, ...rest } = doc as T & { __v?: unknown };
  return { id: String(_id), ...(rest as Omit<T, '_id' | '__v'>) };
};

export const withIds = <T extends { _id?: unknown }>(docs: T[]) => docs.map((d) => withId(d)!);

/** Strip fields that only staff should see. */
export const omit = <T extends object, K extends string>(o: T, keys: readonly K[]) => {
  const out = { ...o } as Record<string, unknown>;
  keys.forEach((k) => delete out[k]);
  return out as Omit<T, K>;
};

/** Shallow diff of the fields a write touched — stored in the audit entry. */
export const diff = (before: Record<string, unknown>, after: Record<string, unknown>) => {
  const out: Record<string, [unknown, unknown]> = {};
  for (const k of Object.keys(after)) {
    if (['updatedAt', 'createdAt', '_id', 'id'].includes(k)) continue;
    if (JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null)) out[k] = [before[k] ?? null, after[k] ?? null];
  }
  return Object.keys(out).length ? out : null;
};
