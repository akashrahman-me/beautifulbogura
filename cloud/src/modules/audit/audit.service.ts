import type { ClientSession } from 'mongoose';
import type { StaffRole } from '@/config/permissions';
import { pageMeta, searchFilter } from '@/utils/pagination';
import { withIds } from '@/utils/serialize';
import { AuditModel } from './audit.model';
import type { ListAuditQuery } from './audit.validator';

/** Who did it — every admin service receives this from the controller. */
export interface Actor {
  id: string;
  name: string;
  role: StaffRole;
}

export interface AuditInput {
  action: string;
  type: string;
  id: string;
  label: string;
  reason?: string | null;
  changes?: Record<string, [unknown, unknown]> | null;
}

/** Record a staff action. Pass the transaction session when the write is part of one. */
export const record = async (actor: Actor, e: AuditInput, session?: ClientSession) => {
  await AuditModel.create(
    [{ actor, action: e.action, resource: { type: e.type, id: e.id, label: e.label }, reason: e.reason ?? null, changes: e.changes ?? null }],
    { session },
  );
};

export const listAudit = async ({ page, limit, search, actor, action, type, from, to }: ListAuditQuery) => {
  const filter = {
    ...(actor && { 'actor.id': actor }),
    ...(action && { action }),
    ...(type && { 'resource.type': type }),
    ...((from || to) && { at: { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(`${to}T23:59:59.999Z`) }) } }),
    ...searchFilter(search, ['actor.name', 'resource.label', 'reason']),
  };
  const [items, total] = await Promise.all([AuditModel.find(filter).sort({ at: -1 }).skip((page - 1) * limit).limit(limit).lean(), AuditModel.countDocuments(filter)]);
  return { items: withIds(items), meta: pageMeta(page, limit, total) };
};

export const recentAudit = async (n: number) => withIds(await AuditModel.find().sort({ at: -1 }).limit(n).lean());
