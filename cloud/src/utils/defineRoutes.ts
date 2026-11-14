import { Router, type RequestHandler } from 'express';
import { z, type ZodObject, type ZodType } from 'zod';
import type { Permission } from '@/config/permissions';
import { authenticate, authorize, optionalAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';

type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface RouteDoc {
  method: Method;
  path: string;
  summary: string;
  tag: string;
  auth: 'none' | 'optional' | 'user' | 'staff';
  permission?: Permission;
  schema?: ZodType;
  status?: number;
}

/** Every route the API serves, for the OpenAPI document (src/docs/openapi.ts). */
export const routeRegistry: RouteDoc[] = [];

interface Options {
  summary: string;
  /** Zod schema of `{ body?, query?, params? }` — validated before the controller. */
  schema?: ZodType;
  /** `user` = any signed-in account; `optional` = anonymous allowed; staff routes give `permission`. */
  auth?: 'none' | 'optional' | 'user';
  permission?: Permission;
  /** Extra middleware (rate limiter, upload) — runs after authentication, before validation. */
  use?: RequestHandler[];
  status?: number;
}

/**
 * A module router that records its routes. The chain is always:
 * authenticate → authorize → extra middleware → validate(schema) → controller
 * (so an upload is never read before the caller is known).
 */
export function defineRoutes(base: string, tag: string) {
  const router = Router();
  const add = (method: Method) => (path: string, opts: Options, handler: RequestHandler) => {
    const auth = opts.permission ? 'staff' : (opts.auth ?? 'none');
    const chain: RequestHandler[] = [];
    if (auth === 'optional') chain.push(optionalAuth);
    if (auth === 'user' || auth === 'staff') chain.push(authenticate);
    if (opts.permission) chain.push(authorize(opts.permission));
    chain.push(...(opts.use ?? []));
    if (opts.schema) chain.push(validate(opts.schema));
    router[method](path, ...chain, handler);
    routeRegistry.push({ method, path: `${base}${path === '/' ? '' : path}`.replace(/:(\w+)/g, '{$1}'), summary: opts.summary, tag, auth, permission: opts.permission, schema: opts.schema, status: opts.status });
  };
  return { base, router, get: add('get'), post: add('post'), patch: add('patch'), put: add('put'), delete: add('delete') };
}

export type ModuleRoutes = ReturnType<typeof defineRoutes>;

/* ---------- shared Zod pieces ---------- */
export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
export const idParams = z.object({ params: z.object({ id: objectId }) });
export const reasonBody = z.object({ reason: z.string().trim().min(2, 'কারণ লিখুন').max(300), note: z.string().trim().max(500).optional() });
/** Accepts Bangla or Latin digits, keeps 01XXXXXXXXX. */
export const bdPhone = z
  .string()
  .transform((v) => v.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[^0-9]/g, ''))
  .refine((v) => /^01[3-9]\d{8}$/.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)');
export const optionalBdPhone = z.union([z.literal(''), bdPhone]).optional().transform((v) => v ?? '');
export const httpUrl = z.string().trim().regex(/^https?:\/\/\S+$/, 'পুরো লিংক দিন');
export const optionalUrl = z.union([z.literal(''), httpUrl]).optional().transform((v) => v ?? '');
/** Hidden field people never see; bots fill it. Must be empty or absent. */
export const honeypot = z.string().max(0, 'স্প্যাম সন্দেহ').optional();
export const queryBool = z.enum(['true', 'false']).transform((v) => v === 'true').optional();
/** Photo URLs this API handed out from /uploads. */
export const imageUrl = z.string().max(500).regex(/^(https?:\/\/[^\s]+)?\/uploads\/[\w.-]+$/, 'ছবির লিংক সঠিক নয়');
export const shape = (s: ZodObject) => s;
