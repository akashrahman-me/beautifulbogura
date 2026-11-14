import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './achiever.controller';
import * as v from './achiever.validator';

export const achieverRoutes = defineRoutes('/achievers', 'People');
achieverRoutes.get('/', { summary: 'Successful sons & daughters (?cadre)', schema: v.listSchema }, c.listAchievers);
export const adminAchieverRoutes = defineRoutes('/admin/achievers', 'Admin · People');
registerContentRoutes(adminAchieverRoutes, c.admin, { permission: 'content.manage', noun: 'achiever', body: v.adminBody, filters: v.adminFilters });
