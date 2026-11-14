import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './freedomFighter.controller';
import * as v from './freedomFighter.validator';

export const freedomFighterRoutes = defineRoutes('/freedom-fighters', 'People');
freedomFighterRoutes.get('/', { summary: 'Freedom fighters (?union)', schema: v.listSchema }, c.listFreedomFighters);
export const adminFreedomFighterRoutes = defineRoutes('/admin/freedom-fighters', 'Admin · People');
registerContentRoutes(adminFreedomFighterRoutes, c.admin, { permission: 'content.manage', noun: 'freedom fighter', body: v.adminBody, filters: v.adminFilters });
