import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '@/app';
import type { StaffRole } from '@/config/permissions';
import { UserModel } from '@/modules/user/user.model';

export const api = () => request(app);
export const SITE = 'http://localhost:3000';
export const CONSOLE = 'http://localhost:3001';

/** Empty every collection (indexes stay). */
export const resetDb = async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
};

/** The refresh cookie from a Set-Cookie header list. */
export const cookieFrom = (res: request.Response, name: string) => {
  const raw = ([] as string[]).concat(res.headers['set-cookie'] ?? []).find((c) => c.startsWith(`${name}=`));
  return raw?.split(';')[0];
};

/**
 * Sign in through the development sign-in form (the same path a real provider callback ends in),
 * then exchange the cookie for an access token like the front ends do.
 */
export const signIn = async (email: string, opts: { name?: string; app?: 'site' | 'console' } = {}) => {
  const app = opts.app ?? 'site';
  const login = await api().post('/api/v1/auth/dev').type('form').send({ provider: 'google', app, returnTo: '/', name: opts.name ?? email.split('@')[0], email });
  const cookieName = app === 'console' ? 'bb_rt_console' : 'bb_rt';
  const cookie = cookieFrom(login, cookieName);
  if (!cookie) return { login, cookie: null, token: null as string | null, user: null as Record<string, unknown> | null };
  const r = await api().post('/api/v1/auth/refresh').set('Origin', app === 'console' ? CONSOLE : SITE).set('Cookie', cookie);
  return { login, cookie: cookieFrom(r, cookieName) ?? cookie, token: r.body.data.accessToken as string, user: r.body.data.user as Record<string, unknown> };
};

/** A staff member signed in to the console. */
export const staff = async (role: StaffRole, email = `${role}-${Math.random().toString(36).slice(2, 7)}@example.com`) => {
  await UserModel.create({ name: `${role} স্টাফ`, email, emailVerified: true, role, identities: [{ provider: 'dev', providerId: email }] });
  const s = await signIn(email, { app: 'console', name: `${role} স্টাফ` });
  return { ...s, auth: { Authorization: `Bearer ${s.token}`, Origin: CONSOLE } };
};

/** A public account signed in to the site. */
export const member = async (email = `u-${Math.random().toString(36).slice(2, 7)}@example.com`) => {
  const s = await signIn(email);
  return { ...s, auth: { Authorization: `Bearer ${s.token}` } };
};

export const tomorrow = () => new Date(Date.now() + 864e5).toISOString();
