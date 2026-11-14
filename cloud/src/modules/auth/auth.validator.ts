import { z } from 'zod';

export const providerParam = z.enum(['google', 'facebook', 'apple']);
const app = z.enum(['site', 'console']).default('site');

export const startSchema = z.object({
  params: z.object({ provider: providerParam }),
  query: z.object({ returnTo: z.string().max(500).optional(), app }),
});

/** Google and Facebook call back with a query string; Apple posts a form. */
export const callbackSchema = z.object({
  params: z.object({ provider: providerParam }),
  query: z.object({ code: z.string().max(2000).optional(), state: z.string().max(200).optional(), error: z.string().max(200).optional() }).loose(),
  body: z.object({ code: z.string().max(2000).optional(), state: z.string().max(200).optional(), error: z.string().max(200).optional(), user: z.string().max(2000).optional() }).loose(),
});

export const devPageSchema = z.object({
  query: z.object({ provider: providerParam.default('google'), returnTo: z.string().max(500).optional(), app }),
});

export const devSignInSchema = z.object({
  body: z.object({
    provider: providerParam.default('google'),
    returnTo: z.string().max(500).optional(),
    app,
    name: z.string().trim().min(2, 'নাম লিখুন').max(80),
    email: z.email('সঠিক ইমেইল দিন'),
  }),
});
