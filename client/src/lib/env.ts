import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:4000/api/v1'),
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  /** `api` talks to the Express backend. `demo` serves bundled sample data; it is opt-in and never a fallback. */
  NEXT_PUBLIC_DATA_MODE: z.enum(['api', 'demo']).default('api'),
});

// NEXT_PUBLIC_ vars must be referenced literally to be inlined at build time
export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE || undefined,
});

export const isDemo = env.NEXT_PUBLIC_DATA_MODE === 'demo';
