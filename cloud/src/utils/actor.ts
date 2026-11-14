import type { Request } from 'express';
import type { StaffRole } from '@/config/permissions';
import type { Actor } from '@/modules/audit/audit.service';
import * as userService from '@/modules/user/user.service';

/** The staff member behind an admin request, for the audit log. Routes have already checked the permission. */
export const actorOf = async (req: Request): Promise<Actor> => {
  const u = await userService.getActorInfo(req.user!.id);
  return { id: req.user!.id, name: u?.name ?? 'স্টাফ', role: (u?.role ?? req.user!.role) as StaffRole };
};
