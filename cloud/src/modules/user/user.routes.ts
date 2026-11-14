import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './user.controller';
import * as v from './user.validator';

export const adminUserRoutes = defineRoutes('/admin/users', 'Admin · Users');
const permission = 'users.manage';
adminUserRoutes.get('/', { summary: 'Public accounts with post and report counts', permission, schema: v.listUsersSchema }, c.listUsers);
adminUserRoutes.get('/:id', { summary: 'One account', permission, schema: v.userIdSchema }, c.getUser);
adminUserRoutes.post('/:id/ban', { summary: 'Ban: no posting, live posts removed, signed out', permission, schema: v.banSchema }, c.banUser);
adminUserRoutes.post('/:id/unban', { summary: 'Lift a ban', permission, schema: v.userIdSchema }, c.unbanUser);
