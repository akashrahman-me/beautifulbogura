import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { can, type Permission } from '@/config/permissions';
import { ApiError } from '@/errors/ApiError';
import * as userService from '@/modules/user/user.service';

interface AccessPayload {
  sub: string;
  app: 'site' | 'console';
}

const bearer = (header: string | undefined) => (header?.startsWith('Bearer ') ? header.slice(7) : null);

/**
 * Verifies the access token, then re-reads the account so a ban or a removed staff role takes effect at once
 * (not when the 15-minute token expires).
 */
const resolve = async (token: string) => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
  const user = await userService.getAuthState(payload.sub);
  if (!user) throw ApiError.unauthorized('অ্যাকাউন্ট পাওয়া যায়নি', 'UNAUTHENTICATED');
  return { id: payload.sub, role: user.role, app: payload.app, banned: user.status === 'banned' };
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = bearer(req.headers.authorization);
  if (!token) return next(ApiError.unauthorized('আবার সাইন ইন করুন', 'UNAUTHENTICATED'));
  const u = await resolve(token);
  req.user = { id: u.id, role: u.role, app: u.app, banned: u.banned };
  next();
};

/** Sets req.user when a valid token is present; anonymous otherwise. A bad token is still an error. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const token = bearer(req.headers.authorization);
  if (token) {
    const u = await resolve(token);
    req.user = { id: u.id, role: u.role, app: u.app, banned: u.banned };
  }
  next();
};

/** Staff permission check (plans/console.md §1). Use after `authenticate`. */
export const authorize =
  (permission: Permission): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('আবার সাইন ইন করুন', 'UNAUTHENTICATED'));
    if (!can(req.user.role, permission)) return next(ApiError.forbidden());
    next();
  };
