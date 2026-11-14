import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './staff.controller';
import * as v from './staff.validator';

export const adminStaffRoutes = defineRoutes('/admin/staff', 'Admin · Staff');
const permission = 'staff.manage';
adminStaffRoutes.get('/', { summary: 'Staff and pending invites', permission, schema: v.listStaffSchema }, c.listStaff);
adminStaffRoutes.post('/', { summary: 'Invite by email with a role', permission, schema: v.inviteSchema, status: 201 }, c.inviteStaff);
adminStaffRoutes.post('/:id/role', { summary: 'Change role (not your own; keeps one admin)', permission, schema: v.roleSchema }, c.changeRole);
adminStaffRoutes.post('/:id/resend', { summary: 'Renew a pending invite', permission, schema: v.staffIdSchema }, c.resendInvite);
adminStaffRoutes.delete('/:id', { summary: 'Remove from staff (signs them out of the console)', permission, schema: v.staffIdSchema, status: 204 }, c.removeStaff);
adminStaffRoutes.post('/:id/restore', { summary: 'Undo a removal', permission, schema: v.staffIdSchema }, c.restoreStaff);
