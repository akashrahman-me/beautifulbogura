import { beforeEach, describe, expect, it } from 'vitest';
import { api, CONSOLE, cookieFrom, member, resetDb, signIn, SITE, staff } from '../../../tests/helpers';
import { UserModel } from '@/modules/user/user.model';

beforeEach(resetDb);

describe('social sign-in', () => {
  it('sends an unconfigured provider to the development sign-in page, keeping a safe return path', async () => {
    const res = await api().get('/api/v1/auth/google?returnTo=//evil.example&app=site');
    expect(res.status).toBe(302);
    const to = new URL(res.headers.location);
    expect(to.pathname).toBe('/api/v1/auth/dev');
    expect(to.searchParams.get('returnTo')).toBe('/');
  });

  it('rejects an unknown provider', async () => {
    expect((await api().get('/api/v1/auth/twitter')).status).toBe(400);
  });

  it('creates the account on first sign-in and returns to the site with a refresh cookie', async () => {
    const res = await api().post('/api/v1/auth/dev').type('form').send({ provider: 'facebook', app: 'site', returnTo: '/jobs/new', name: 'রাকিব', email: 'rakib@example.com' });
    expect(res.status).toBe(303);
    expect(res.headers.location).toBe(`${SITE}/jobs/new`);
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/bb_rt=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\/api\/v1\/auth/);
    const u = await UserModel.findOne({ email: 'rakib@example.com' }).lean();
    expect(u?.provider).toBe('facebook');
    // Same email again → same account, no duplicate.
    await signIn('rakib@example.com');
    expect(await UserModel.countDocuments({ email: 'rakib@example.com' })).toBe(1);
  });

  it('refresh returns an access token and the profile; /auth/me works with it', async () => {
    const m = await member('me@example.com');
    expect(m.token).toBeTruthy();
    expect(m.user).toMatchObject({ email: 'me@example.com', role: null, provider: 'google' });
    const me = await api().get('/api/v1/auth/me').set(m.auth);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('me@example.com');
  });

  it('rotates refresh tokens and revokes the whole family when an old one is reused', async () => {
    const login = await api().post('/api/v1/auth/dev').type('form').send({ provider: 'google', app: 'site', name: 'চুরি', email: 'theft@example.com' });
    const first = cookieFrom(login, 'bb_rt')!;
    const r1 = await api().post('/api/v1/auth/refresh').set('Origin', SITE).set('Cookie', first);
    expect(r1.status).toBe(200);
    const second = cookieFrom(r1, 'bb_rt')!;
    expect(second).not.toBe(first);
    // Replaying the first token = theft signal.
    const replay = await api().post('/api/v1/auth/refresh').set('Origin', SITE).set('Cookie', first);
    expect(replay.status).toBe(401);
    expect(replay.body.code).toBe('SESSION_REVOKED');
    // …and the legitimate newer token is revoked too.
    expect((await api().post('/api/v1/auth/refresh').set('Origin', SITE).set('Cookie', second)).status).toBe(401);
  });

  it('refuses the console to non-staff and lets staff in with a separate cookie', async () => {
    const res = await api().post('/api/v1/auth/dev').type('form').send({ provider: 'google', app: 'console', name: 'সাধারণ', email: 'plain@example.com' });
    expect(res.status).toBe(303);
    expect(res.headers.location).toBe(`${CONSOLE}/login?authError=not_staff`);
    expect(cookieFrom(res, 'bb_rt_console')).toBeUndefined();

    const s = await staff('moderator');
    expect(s.user?.role).toBe('moderator');
    expect(cookieFrom(s.login, 'bb_rt_console')).toBeTruthy();
  });

  it('makes configured owner emails admins on first sign-in', async () => {
    const s = await signIn('owner@example.com', { app: 'console' });
    expect(s.user?.role).toBe('admin');
  });

  it('logout revokes the session (204) and the cookie no longer refreshes', async () => {
    const m = await member('bye@example.com');
    const out = await api().post('/api/v1/auth/logout').set('Origin', SITE).set('Cookie', m.cookie!);
    expect(out.status).toBe(204);
    expect((await api().post('/api/v1/auth/refresh').set('Origin', SITE).set('Cookie', m.cookie!)).status).toBe(401);
  });

  it('401 without a cookie, 401 with a forged access token', async () => {
    const r = await api().post('/api/v1/auth/refresh').set('Origin', SITE);
    expect(r.status).toBe(401);
    expect(r.body).toMatchObject({ success: false, code: 'NO_SESSION' });
    expect((await api().get('/api/v1/auth/me').set('Authorization', 'Bearer not-a-jwt')).body.code).toBe('INVALID_TOKEN');
  });

  it('serves the development sign-in page with staff shortcuts for the console', async () => {
    await staff('editor', 'ed@example.com');
    const page = await api().get('/api/v1/auth/dev?app=console&provider=apple');
    expect(page.status).toBe(200);
    expect(page.text).toContain('ed@example.com');
    expect(page.text).not.toContain('<script');
  });
});
