import type { CookieOptions, Request, Response } from 'express';
import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';
import { logger } from '@/utils/logger';
import { sendResponse } from '@/utils/sendResponse';
import * as staffService from '@/modules/staff/staff.service';
import * as authService from './auth.service';
import { devSignInPage } from './auth.devPage';

const COOKIE_PATH = '/api/v1/auth';
const refreshCookie = (expires: Date): CookieOptions => ({ httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: COOKIE_PATH, expires });
const meta = (req: Request) => ({ ip: req.ip, userAgent: req.get('user-agent') });
/** Which front end is calling — by its Origin. Navigations carry the app in the OAuth state instead. */
const appOf = (req: Request): authService.App => (req.get('origin') === env.CONSOLE_URL ? 'console' : 'site');

const finish = async (res: Response, req: Request, profile: Parameters<typeof authService.finishSignIn>[0], app: authService.App, returnTo: string) => {
  const r = await authService.finishSignIn(profile, app, meta(req));
  if (r.refused) return res.redirect(303, authService.errorRedirect(app, r.refused));
  res.cookie(authService.cookieName(app), r.refreshToken, refreshCookie(r.expiresAt));
  res.redirect(303, new URL(returnTo, authService.appUrl(app)).toString());
};

export const start = async (req: Request, res: Response) => {
  const { provider } = req.validated.params;
  const { returnTo, app } = req.validated.query;
  const r = authService.startSignIn(provider, returnTo, app);
  if (r.stateToken) {
    // Apple returns by cross-site POST, which only carries SameSite=None cookies.
    const sameSite = provider === 'apple' ? 'none' : 'lax';
    res.cookie(authService.STATE_COOKIE, r.stateToken, { httpOnly: true, secure: env.COOKIE_SECURE || sameSite === 'none', sameSite, path: COOKIE_PATH, maxAge: 10 * 60_000 });
  }
  res.redirect(302, r.redirect);
};

export const callback = async (req: Request, res: Response) => {
  const { provider } = req.validated.params;
  const input = { ...req.validated.query, ...req.validated.body };
  const stateToken = req.cookies?.[authService.STATE_COOKIE] as string | undefined;
  res.clearCookie(authService.STATE_COOKIE, { path: COOKIE_PATH });
  try {
    const r = await authService.completeSignIn(provider, input, stateToken);
    if (r.cancelled || !r.profile) return res.redirect(303, authService.errorRedirect(r.app, 'cancelled', r.returnTo));
    if (!r.profile.email && provider !== 'apple') logger.warn({ provider }, 'Provider returned no email');
    await finish(res, req, r.profile, r.app, r.returnTo);
  } catch (err) {
    logger.warn({ err, provider }, 'Sign-in callback failed');
    res.redirect(303, authService.errorRedirect('site', 'provider_error'));
  }
};

export const devPage = async (req: Request, res: Response) => {
  if (!env.AUTH_DEV_LOGIN) throw ApiError.notFound();
  const staff = req.validated.query.app === 'console' ? await staffService.devStaffShortcuts() : [];
  // The form posts here and the answer redirects to a front end; browsers check form-action along the redirect.
  res.setHeader('Content-Security-Policy', `default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'self' ${env.CLIENT_URL} ${env.CONSOLE_URL}`);
  res.type('html').send(devSignInPage(req.validated.query, staff));
};

export const devSignIn = async (req: Request, res: Response) => {
  if (!env.AUTH_DEV_LOGIN) throw ApiError.notFound();
  const { provider, returnTo, app, name, email } = req.validated.body;
  await finish(res, req, { provider: 'dev', providerId: email.toLowerCase(), email, emailVerified: true, name, avatar: null, shownAs: provider }, app, authService.safeReturnTo(returnTo));
};

export const refresh = async (req: Request, res: Response) => {
  const app = appOf(req);
  try {
    const r = await authService.refresh(req.cookies?.[authService.cookieName(app)], app, meta(req));
    res.cookie(authService.cookieName(app), r.refreshToken, refreshCookie(r.expiresAt));
    sendResponse(res, { message: 'Session refreshed', data: { accessToken: r.accessToken, user: r.user } });
  } catch (err) {
    res.clearCookie(authService.cookieName(app), { path: COOKIE_PATH });
    throw err;
  }
};

export const logout = async (req: Request, res: Response) => {
  const app = appOf(req);
  await authService.logout(req.cookies?.[authService.cookieName(app)], app);
  res.clearCookie(authService.cookieName(app), { path: COOKIE_PATH });
  res.status(204).send();
};

export const me = async (req: Request, res: Response) => {
  sendResponse(res, { message: 'Profile fetched', data: await authService.me(req.user!.id) });
};
