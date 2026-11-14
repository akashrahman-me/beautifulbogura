import { createHash, randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';
import * as staffService from '@/modules/staff/staff.service';
import * as userService from '@/modules/user/user.service';
import { authorizeUrl, exchange, isConfigured, randomToken, type Provider } from './auth.providers';
import { SessionModel } from './session.model';

export type App = 'site' | 'console';
export const appUrl = (app: App) => (app === 'console' ? env.CONSOLE_URL : env.CLIENT_URL);
/** Separate cookies, so signing out of the console does not sign the same person out of the site. */
export const cookieName = (app: App) => (app === 'console' ? 'bb_rt_console' : 'bb_rt');
export const STATE_COOKIE = 'bb_oauth';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export const safeReturnTo = (p: string | undefined) => (p && p.startsWith('/') && !p.startsWith('//') && !p.includes('\\') ? p : '/');

export const signAccessToken = (userId: string, app: App) =>
  jwt.sign({ app }, env.JWT_ACCESS_SECRET, { subject: userId, expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] });

/* ---------- OAuth round trip ---------- */

interface OAuthState {
  provider: Provider;
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  app: App;
}

/** Where to send the browser to start signing in, plus the signed state cookie to set. */
export const startSignIn = (provider: Provider, returnTo: string | undefined, app: App) => {
  const back = safeReturnTo(returnTo);
  if (!isConfigured(provider)) {
    // Development stands in a local sign-in page; elsewhere the front end shows an error.
    if (env.AUTH_DEV_LOGIN) {
      const u = new URL(`${env.API_URL}/api/v1/auth/dev`);
      u.search = new URLSearchParams({ provider, returnTo: back, app }).toString();
      return { redirect: u.toString(), stateToken: null };
    }
    return { redirect: errorRedirect(app, 'provider_error', back), stateToken: null };
  }
  const s: OAuthState = { provider, state: randomToken(), nonce: randomToken(), verifier: randomToken(48), returnTo: back, app };
  const stateToken = jwt.sign(s, env.OAUTH_STATE_SECRET, { expiresIn: '10m' });
  return { redirect: authorizeUrl(provider, s), stateToken };
};

export const errorRedirect = (app: App, code: string, returnTo = '/') => {
  const u = new URL(app === 'console' ? '/login' : returnTo, appUrl(app));
  u.searchParams.set('authError', code);
  return u.toString();
};

/** Verify the state cookie against the callback and turn the code into a profile. */
export const completeSignIn = async (provider: Provider, q: { code?: string; state?: string; error?: string; user?: string }, stateToken: string | undefined) => {
  let s: OAuthState;
  try {
    s = jwt.verify(stateToken ?? '', env.OAUTH_STATE_SECRET) as OAuthState;
  } catch {
    throw ApiError.badRequest('Sign-in expired', 'STATE_INVALID');
  }
  if (s.provider !== provider || s.state !== q.state) throw ApiError.badRequest('State mismatch', 'STATE_INVALID');
  if (q.error || !q.code) return { app: s.app, returnTo: s.returnTo, profile: null, cancelled: true };
  const profile = await exchange(provider, q.code, s, { user: q.user });
  return { app: s.app, returnTo: s.returnTo, profile, cancelled: false };
};

/**
 * After a provider (or the dev page) vouches for someone: find or create the account, accept a staff
 * invite for that email, refuse the console to non-staff, and open a session.
 */
export const finishSignIn = async (profile: userService.ProviderProfile, app: App, meta: { ip?: string; userAgent?: string }) => {
  let user = await userService.upsertFromProvider(profile);
  if (user.email && user.emailVerified) user = (await staffService.acceptInviteFor(user)) ?? user;
  if (app === 'console' && !user.role) return { refused: 'not_staff' as const };
  const session = await createSession(user.id as string, app, meta);
  return { refused: null, refreshToken: session.token, expiresAt: session.expiresAt };
};

/* ---------- refresh-token sessions ---------- */

const createSession = async (userId: string, app: App, meta: { ip?: string; userAgent?: string }, family: string = randomUUID()) => {
  const token = randomToken(48);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 864e5);
  await SessionModel.create({ user: userId, app, tokenHash: hash(token), family, expiresAt, ip: meta.ip ?? null, userAgent: meta.userAgent?.slice(0, 300) ?? null });
  return { token, expiresAt };
};

/**
 * Rotate a refresh token: the old one stops working, a new one is issued. A token that was already
 * rotated or revoked means it leaked — the whole family is revoked and the person signs in again.
 */
export const refresh = async (token: string | undefined, app: App, meta: { ip?: string; userAgent?: string }) => {
  if (!token) throw ApiError.unauthorized('সাইন ইন করা নেই', 'NO_SESSION');
  const session = await SessionModel.findOne({ tokenHash: hash(token), app });
  if (!session || session.expiresAt < new Date()) throw ApiError.unauthorized('সাইন ইন করা নেই', 'NO_SESSION');
  if (session.rotatedAt || session.revokedAt) {
    await SessionModel.updateMany({ family: session.family, revokedAt: null }, { revokedAt: new Date() });
    throw ApiError.unauthorized('নিরাপত্তার কারণে আবার সাইন ইন করুন', 'SESSION_REVOKED');
  }
  const user = await userService.getUserDoc(String(session.user)).catch(() => null);
  if (!user || (app === 'console' && !user.role)) {
    session.revokedAt = new Date();
    await session.save();
    throw ApiError.unauthorized('সাইন ইন করা নেই', app === 'console' ? 'NOT_STAFF' : 'NO_SESSION');
  }
  session.rotatedAt = new Date();
  await session.save();
  const next = await createSession(user.id as string, app, meta, session.family);
  user.lastSeenAt = new Date();
  await user.save();
  return { refreshToken: next.token, expiresAt: next.expiresAt, accessToken: signAccessToken(user.id as string, app), user: userService.toSessionUser(user) };
};

export const logout = async (token: string | undefined, app: App) => {
  if (!token) return;
  await SessionModel.updateOne({ tokenHash: hash(token), app }, { revokedAt: new Date() });
};

export const me = async (userId: string) => userService.toSessionUser(await userService.getUserDoc(userId));
