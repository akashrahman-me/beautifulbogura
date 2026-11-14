import { z } from 'zod';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Query fields every list accepts. `maxLimit` is per endpoint (admin pickers may ask for more). */
export const listQuery = (maxLimit = 50, defaultLimit = 20) =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
    search: z.string().trim().max(100).optional(),
    sort: z
      .string()
      .regex(/^-?[a-zA-Z.]+$/)
      .optional(),
  });

export const pageMeta = (page: number, limit: number, total: number): PageMeta => ({ page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });

/** `field` / `-field` → Mongo sort, only for whitelisted fields; falls back to `fallback`. */
export const toSort = (sort: string | undefined, allowed: readonly string[], fallback: Record<string, 1 | -1>): Record<string, 1 | -1> => {
  if (!sort) return fallback;
  const key = sort.replace(/^-/, '');
  if (!allowed.includes(key)) return fallback;
  return { [key]: sort.startsWith('-') ? -1 : 1, _id: -1 };
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive “contains” across fields. The input is escaped, so it can never act as a regex. */
export const searchFilter = (search: string | undefined, fields: readonly string[]) => {
  if (!search) return {};
  const re = new RegExp(escape(search), 'i');
  return { $or: fields.map((f) => ({ [f]: re })) };
};
