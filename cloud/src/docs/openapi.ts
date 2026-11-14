import { z, type ZodType } from 'zod';
import { env } from '@/config/env';
import { routeRegistry } from '@/utils/defineRoutes';

const json = (s: ZodType) => {
  try {
    return z.toJSONSchema(s, { io: 'input', unrepresentable: 'any' });
  } catch {
    return {};
  }
};

/** OpenAPI 3.1 built from every route's Zod schema (served at /api/docs). */
export const buildOpenApi = () => {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const r of routeRegistry) {
    const shape = (r.schema as unknown as { shape?: Record<string, ZodType> } | undefined)?.shape ?? {};
    const parameters: unknown[] = [];
    for (const where of ['params', 'query'] as const) {
      const part = shape[where] as unknown as { shape?: Record<string, ZodType> } | undefined;
      // Refined objects (voter lookup) expose their shape through `in` on Zod 4 pipes; fall back gracefully.
      const fields = part?.shape ?? (part as unknown as { def?: { in?: { shape?: Record<string, ZodType> } } })?.def?.in?.shape ?? {};
      for (const [name, s] of Object.entries(fields)) parameters.push({ name, in: where === 'params' ? 'path' : 'query', required: where === 'params', schema: json(s) });
    }
    const op: Record<string, unknown> = {
      tags: [r.tag],
      summary: r.summary,
      ...(parameters.length && { parameters }),
      ...(shape.body && r.method !== 'get' && { requestBody: { content: { 'application/json': { schema: json(shape.body) } } } }),
      ...((r.auth === 'user' || r.auth === 'staff') && { security: [{ bearer: [] }] }),
      ...(r.permission && { 'x-permission': r.permission }),
      responses: { [String(r.status ?? 200)]: { description: r.status === 204 ? 'No content' : 'Success envelope' }, default: { description: 'Error envelope { success:false, message, code, errors? }' } },
    };
    const p = `/api/v1${r.path}`;
    paths[p] = { ...(paths[p] ?? {}), [r.method]: op };
  }
  return {
    openapi: '3.1.0',
    info: { title: 'বিউটিফুল বগুড়া API', version: '1.0.0', description: 'Public API for the site and staff API (/admin) for the console. Envelope: { success, message, data, meta? }.' },
    servers: [{ url: env.API_URL }],
    components: { securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    paths,
  };
};
