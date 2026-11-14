import type { StaffRole } from '@/config/permissions';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import * as sessions from '@/modules/auth/session.service';
import * as userService from '@/modules/user/user.service';
import type { UserDocument } from '@/modules/user/user.model';
import { pageMeta } from '@/utils/pagination';
import { StaffInviteModel } from './staffInvite.model';

/** Staff = accounts with a role, plus invites waiting for their first sign-in. */
export const listStaff = async (page: number, limit: number) => {
  const [users, invites] = await Promise.all([userService.listStaffUsers(), StaffInviteModel.find({ status: 'pending' }).sort({ invitedAt: -1 }).lean()]);
  const rows = [
    ...users.map((u) => ({ id: String(u._id), name: u.name, email: u.email ?? '', avatar: u.avatar ?? null, provider: u.provider, role: u.role, status: 'active' as const, invitedBy: u.invitedBy ?? null, invitedAt: u.staffSince ?? u.createdAt, lastActiveAt: u.lastSeenAt })),
    ...invites.map((i) => ({ id: String(i._id), name: '', email: i.email, avatar: null, provider: null, role: i.role, status: 'invited' as const, invitedBy: i.invitedBy, invitedAt: i.invitedAt, lastActiveAt: null })),
  ];
  return { items: rows.slice((page - 1) * limit, page * limit), meta: pageMeta(page, limit, rows.length) };
};

/** Invite by email. Someone who already has an account with that verified email gets the role at once. */
export const invite = async (email: string, role: StaffRole, actor: audit.Actor) => {
  const existing = await userService.findByVerifiedEmail(email);
  if (existing?.role || (await StaffInviteModel.exists({ email: email.toLowerCase(), status: 'pending' }))) {
    throw ApiError.conflict('এই ইমেইল আগেই স্টাফ তালিকায় আছে', 'STAFF_EXISTS', [{ path: 'email', message: 'এই ইমেইল আগেই স্টাফ তালিকায় আছে' }]);
  }
  if (existing) {
    await userService.setRole(existing.id as string, role, { invitedBy: actor.name });
    await audit.record(actor, { action: 'staff.invite', type: 'staff', id: existing.id as string, label: email });
    return { id: existing.id as string, email, role, status: 'active' as const };
  }
  const inv = await StaffInviteModel.create({ email, role, invitedBy: actor.name, invitedById: actor.id });
  await audit.record(actor, { action: 'staff.invite', type: 'staff', id: inv.id as string, label: email });
  return { id: inv.id as string, email, role, status: 'invited' as const };
};

/** Called on sign-in: a pending invite for this verified email becomes the account's role. */
export const acceptInviteFor = async (user: UserDocument) => {
  const inv = await StaffInviteModel.findOne({ email: user.email, status: 'pending' });
  if (!inv) return null;
  inv.status = 'accepted';
  inv.acceptedAt = new Date();
  await inv.save();
  if (user.role) return user;
  const { user: updated } = await userService.setRole(user.id as string, inv.role as StaffRole, { invitedBy: inv.invitedBy });
  return updated;
};

const guardAdmins = async (targetRole: string | null | undefined, nextRole: StaffRole | null) => {
  if (targetRole === 'admin' && nextRole !== 'admin' && (await userService.countActiveAdmins()) <= 1) {
    throw ApiError.conflict('অন্তত একজন প্রশাসক থাকতে হবে', 'LAST_ADMIN');
  }
};

export const changeRole = async (id: string, role: StaffRole, actor: audit.Actor) => {
  if (id === actor.id) throw ApiError.conflict('নিজের ভূমিকা নিজে বদলানো যায় না', 'SELF');
  const inv = await StaffInviteModel.findOne({ _id: id, status: 'pending' });
  if (inv) {
    const before = inv.role;
    inv.role = role;
    await inv.save();
    await audit.record(actor, { action: 'staff.role', type: 'staff', id, label: inv.email, changes: { role: [before, role] } });
    return { id, role };
  }
  const user = await userService.getUserDoc(id);
  if (!user.role) throw ApiError.notFound('স্টাফ পাওয়া যায়নি', 'STAFF_NOT_FOUND');
  await guardAdmins(user.role, role);
  const { before } = await userService.setRole(id, role);
  await audit.record(actor, { action: 'staff.role', type: 'staff', id, label: user.name, changes: { role: [before, role] } });
  return { id, role };
};

export const resendInvite = async (id: string, actor: audit.Actor) => {
  const inv = await StaffInviteModel.findOne({ _id: id, status: 'pending' });
  if (!inv) throw ApiError.notFound('আমন্ত্রণ পাওয়া যায়নি', 'INVITE_NOT_FOUND');
  inv.invitedAt = new Date();
  await inv.save();
  await audit.record(actor, { action: 'staff.invite', type: 'staff', id, label: inv.email });
  return { id, email: inv.email };
};

/** Remove from staff (the account stays a normal public account). Signs them out of the console at once. */
export const removeStaff = async (id: string, actor: audit.Actor) => {
  if (id === actor.id) throw ApiError.conflict('নিজেকে সরানো যায় না', 'SELF');
  const inv = await StaffInviteModel.findOne({ _id: id, status: 'pending' });
  if (inv) {
    inv.status = 'revoked';
    await inv.save();
    await audit.record(actor, { action: 'staff.remove', type: 'staff', id, label: inv.email });
    return;
  }
  const user = await userService.getUserDoc(id);
  if (!user.role) throw ApiError.notFound('স্টাফ পাওয়া যায়নি', 'STAFF_NOT_FOUND');
  await guardAdmins(user.role, null);
  await userService.setRole(id, null);
  await sessions.revokeAllSessions(id, 'console');
  await audit.record(actor, { action: 'staff.remove', type: 'staff', id, label: user.name });
};

/** Undo a removal (the console's “ফিরিয়ে আনুন”). */
export const restoreStaff = async (id: string, actor: audit.Actor) => {
  const inv = await StaffInviteModel.findOne({ _id: id, status: 'revoked' });
  if (inv) {
    if (await StaffInviteModel.exists({ email: inv.email, status: 'pending' })) throw ApiError.conflict('আবার আমন্ত্রণ আছে', 'STAFF_EXISTS');
    inv.status = 'pending';
    await inv.save();
    return { id };
  }
  const user = await userService.getUserDoc(id);
  if (user.role || !user.formerRole) throw ApiError.notFound('ফেরানোর মতো কিছু নেই', 'NOTHING_TO_RESTORE');
  await userService.setRole(id, user.formerRole as StaffRole);
  await audit.record(actor, { action: 'staff.role', type: 'staff', id, label: user.name, changes: { role: [null, user.formerRole] } });
  return { id };
};

/** Development sign-in page shortcuts (only rendered when AUTH_DEV_LOGIN is on). */
export const devStaffShortcuts = async () => (await userService.listStaffUsers()).slice(0, 8).map((u) => ({ name: u.name, email: u.email ?? '', role: u.role ?? '' })).filter((u) => u.email);
