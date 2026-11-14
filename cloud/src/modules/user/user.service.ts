import type { ClientSession } from 'mongoose';
import { env } from '@/config/env';
import type { StaffRole } from '@/config/permissions';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import type { Actor } from '@/modules/audit/audit.service';
import * as sessions from '@/modules/auth/session.service';
import * as postService from '@/modules/post/post.service';
import { pageMeta, searchFilter, toSort } from '@/utils/pagination';
import { withTransaction } from '@/utils/transaction';
import { UserModel, type UserDocument } from './user.model';

export interface ProviderProfile {
  provider: 'google' | 'facebook' | 'apple' | 'dev';
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  avatar: string | null;
  /** For the dev sign-in: which real provider button was pressed (shown on the account page). */
  shownAs?: 'google' | 'facebook' | 'apple';
}

/** What `authenticate` needs on every request: cheap, indexed. */
export const getAuthState = async (id: string) => UserModel.findById(id).select('role status').lean<{ role: StaffRole | null; status: 'active' | 'banned' }>();

/**
 * First sign-in creates the account; later ones find it by provider identity. A verified email that
 * already belongs to an account links the new provider to it (Google today, Facebook tomorrow = one person).
 */
export const upsertFromProvider = async (p: ProviderProfile) => {
  const identity = { provider: p.provider, providerId: p.providerId };
  const shown = p.shownAs ?? (p.provider === 'dev' ? 'google' : p.provider);
  let user = await UserModel.findOne({ identities: { $elemMatch: identity } });
  if (!user && p.email && p.emailVerified) {
    user = await UserModel.findOne({ email: p.email.toLowerCase() });
    if (user) user.identities.push(identity);
  }
  if (!user) {
    user = new UserModel({ name: p.name || 'ব্যবহারকারী', email: p.email?.toLowerCase() ?? null, emailVerified: p.emailVerified, avatar: p.avatar, identities: [identity] });
  }
  if (!user.avatar && p.avatar) user.avatar = p.avatar;
  if (p.email && p.emailVerified && !user.emailVerified) {
    user.email = p.email.toLowerCase();
    user.emailVerified = true;
  }
  user.provider = shown;
  user.lastSeenAt = new Date();
  // Bootstrap: configured owner emails are admins from their first sign-in.
  if (user.email && user.emailVerified && env.ADMIN_EMAILS.includes(user.email) && user.role !== 'admin') {
    user.role = 'admin';
    user.staffSince ??= new Date();
  }
  await user.save();
  return user;
};

export const getUserDoc = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) throw ApiError.notFound('অ্যাকাউন্ট পাওয়া যায়নি', 'USER_NOT_FOUND');
  return user;
};

/** The profile the front ends keep in their session store. */
export const toSessionUser = (u: UserDocument) => ({
  id: u.id as string,
  name: u.name,
  email: u.email ?? null,
  avatar: u.avatar ?? null,
  provider: u.provider,
  role: (u.role ?? null) as StaffRole | null,
});

/** Name and role of a staff member, for audit entries. */
export const getActorInfo = (id: string) => UserModel.findById(id).select('name role').lean<{ name: string; role: StaffRole | null }>();

/* ---------- staff helpers (used by the staff and auth services) ---------- */

export const findByVerifiedEmail = (email: string) => UserModel.findOne({ email: email.toLowerCase(), emailVerified: true });

export const listStaffUsers = () => UserModel.find({ role: { $ne: null } }).sort({ name: 1 }).lean();

export const countActiveAdmins = () => UserModel.countDocuments({ role: 'admin', status: 'active' });

export const setRole = async (id: string, role: StaffRole | null, opts: { invitedBy?: string; session?: ClientSession } = {}) => {
  const user = await UserModel.findById(id).session(opts.session ?? null);
  if (!user) throw ApiError.notFound('স্টাফ পাওয়া যায়নি', 'STAFF_NOT_FOUND');
  const before = user.role ?? null;
  if (role === null) user.formerRole = user.role;
  else {
    user.staffSince ??= new Date();
    if (opts.invitedBy) user.invitedBy = opts.invitedBy;
  }
  user.role = role;
  await user.save({ session: opts.session });
  return { user, before };
};

/* ---------- console: public accounts ---------- */

type UserRow = Record<string, unknown> & { _id: unknown; ban?: { reason: string; at: Date; by: string } | null };

const adminView = (u: UserRow, c?: { posts: number; active: number; removed: number; reports: number }) => ({
  id: String(u._id),
  name: u.name,
  email: u.email ?? null,
  avatar: u.avatar ?? null,
  provider: u.provider,
  status: u.status,
  role: u.role ?? null,
  joinedAt: u.createdAt,
  lastSeenAt: u.lastSeenAt,
  posts: c?.posts ?? 0,
  activePosts: c?.active ?? 0,
  removedPosts: c?.removed ?? 0,
  reportsAgainst: c?.reports ?? 0,
  ban: u.ban ? { reason: u.ban.reason, at: u.ban.at, by: u.ban.by } : null,
});

export const adminListUsers = async (q: { page: number; limit: number; search?: string; sort?: string; status?: string; provider?: string }) => {
  const filter = {
    ...(q.status && { status: q.status }),
    ...(q.provider && { provider: q.provider }),
    ...searchFilter(q.search, ['name', 'email']),
  };
  const sortKey = q.sort?.replace(/^-/, '');
  // Post-derived sorts (posts, reports) happen on the page; joined-date and name are indexed.
  const sort = toSort(sortKey === 'joinedAt' ? q.sort?.replace('joinedAt', 'createdAt') : q.sort, ['createdAt', 'name', 'lastSeenAt'], { createdAt: -1 });
  const [docs, total] = await Promise.all([UserModel.find(filter as never).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit).lean(), UserModel.countDocuments(filter as never)]);
  const counts = await postService.countsByOwners(docs.map((d) => String(d._id)));
  let items = docs.map((d) => adminView(d as UserRow, counts.get(String(d._id))));
  if (sortKey === 'posts' || sortKey === 'reportsAgainst') {
    const dir = q.sort!.startsWith('-') ? -1 : 1;
    items = items.sort((a, b) => dir * ((a[sortKey] as number) - (b[sortKey] as number)));
  }
  return { items, meta: pageMeta(q.page, q.limit, total) };
};

export const adminGetUser = async (id: string) => {
  const u = await UserModel.findById(id).lean();
  if (!u) throw ApiError.notFound('ব্যবহারকারী পাওয়া যায়নি', 'USER_NOT_FOUND');
  return adminView(u as UserRow, (await postService.countsByOwners([id])).get(id));
};

/** Ban: no more posting, live posts off the site, signed out everywhere. One transaction when given one. */
export const banUser = async (id: string, reason: string, actor: Actor, session?: ClientSession) => {
  const run = async (s: ClientSession) => {
    const u = await UserModel.findById(id).session(s);
    if (!u) throw ApiError.notFound('ব্যবহারকারী পাওয়া যায়নি', 'USER_NOT_FOUND');
    if (u.role) throw ApiError.conflict('স্টাফকে নিষিদ্ধ করা যায় না — আগে স্টাফ থেকে সরান', 'IS_STAFF');
    u.status = 'banned';
    u.set('ban', { reason, at: new Date(), by: actor.name, byId: actor.id });
    await u.save({ session: s });
    await postService.removeAllForOwner(id, 'পোস্টদাতা নিষিদ্ধ', s);
    await audit.record(actor, { action: 'user.ban', type: 'user', id, label: u.name, reason }, s);
  };
  if (session) await run(session);
  else await withTransaction(run);
  await sessions.revokeAllSessions(id);
  return adminGetUser(id);
};

/** Lift a ban. Removed posts stay removed; staff restore them from the posts page if they should return. */
export const unbanUser = async (id: string, actor: Actor) => {
  const u = await UserModel.findById(id);
  if (!u) throw ApiError.notFound('ব্যবহারকারী পাওয়া যায়নি', 'USER_NOT_FOUND');
  u.status = 'active';
  u.set('ban', null);
  await u.save();
  await audit.record(actor, { action: 'user.unban', type: 'user', id, label: u.name });
  return adminGetUser(id);
};

export const dashboardCounts = async () => {
  const [newUsers7d, bannedUsers] = await Promise.all([UserModel.countDocuments({ createdAt: { $gt: new Date(Date.now() - 7 * 864e5) } }), UserModel.countDocuments({ status: 'banned' })]);
  return { newUsers7d, bannedUsers };
};

export const searchAdmin = (q: string, limit: number) => UserModel.find(searchFilter(q, ['name', 'email']) as never).limit(limit).lean();
