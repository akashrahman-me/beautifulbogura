import { authLimiter } from '@/middlewares/rateLimiter';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './auth.controller';
import * as v from './auth.validator';

export const authRoutes = defineRoutes('/auth', 'Auth');
const use = [authLimiter];

// Order matters: the literal /dev, /refresh, /logout, /me paths come before /:provider.
authRoutes.get('/dev', { summary: 'Development sign-in page (AUTH_DEV_LOGIN only)', schema: v.devPageSchema, use }, c.devPage);
authRoutes.post('/dev', { summary: 'Development sign-in (AUTH_DEV_LOGIN only)', schema: v.devSignInSchema, use }, c.devSignIn);
authRoutes.post('/refresh', { summary: 'Rotate the refresh cookie → { accessToken, user }', use }, c.refresh);
authRoutes.post('/logout', { summary: 'Revoke this session and clear its cookie', use, status: 204 }, c.logout);
authRoutes.get('/me', { summary: 'The signed-in account', auth: 'user' }, c.me);
authRoutes.get('/:provider', { summary: 'Start social sign-in (browser navigation)', schema: v.startSchema, use }, c.start);
authRoutes.get('/:provider/callback', { summary: 'Provider callback (Google, Facebook)', schema: v.callbackSchema, use }, c.callback);
authRoutes.post('/:provider/callback', { summary: 'Provider callback (Apple form_post)', schema: v.callbackSchema, use }, c.callback);
