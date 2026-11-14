import 'dotenv/config';
import { z } from 'zod';

const bool = z.enum(['true', 'false']).transform((v) => v === 'true');
const csv = z.string().default('').transform((v) => v.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),
    API_URL: z.url().default('http://localhost:4000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

    MONGODB_URI: z.string().min(1),

    CLIENT_URL: z.url(),
    CONSOLE_URL: z.url(),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    OAUTH_STATE_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(365).default(30),
    COOKIE_SECURE: bool.default(true),

    ADMIN_EMAILS: csv,

    GOOGLE_CLIENT_ID: z.string().default(''),
    GOOGLE_CLIENT_SECRET: z.string().default(''),
    FACEBOOK_APP_ID: z.string().default(''),
    FACEBOOK_APP_SECRET: z.string().default(''),
    APPLE_CLIENT_ID: z.string().default(''),
    APPLE_TEAM_ID: z.string().default(''),
    APPLE_KEY_ID: z.string().default(''),
    APPLE_PRIVATE_KEY: z.string().default('').transform((v) => v.replace(/\\n/g, '\n')),
    AUTH_DEV_LOGIN: bool.default(false),

    UPLOAD_DIR: z.string().default('uploads'),
    UPLOAD_MAX_MB: z.coerce.number().min(1).max(20).default(5),

    VAPID_PUBLIC_KEY: z.string().default(''),
    VAPID_PRIVATE_KEY: z.string().default(''),
    VAPID_SUBJECT: z.string().default('mailto:admin@example.com'),

    WEATHER_LAT: z.coerce.number().default(24.8465),
    WEATHER_LON: z.coerce.number().default(89.3776),
  })
  .refine((e) => !(e.NODE_ENV === 'production' && e.AUTH_DEV_LOGIN), { path: ['AUTH_DEV_LOGIN'], message: 'must be false in production' })
  .refine((e) => !(e.NODE_ENV === 'production' && !e.COOKIE_SECURE), { path: ['COOKIE_SECURE'], message: 'must be true in production' });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
