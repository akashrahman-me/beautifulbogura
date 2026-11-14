import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './notable.controller';
import * as v from './notable.validator';

export const notableRoutes = defineRoutes('/notable-persons', 'People');
notableRoutes.get('/', { summary: 'Published biographies, without the body (?field)', schema: v.listSchema }, c.listNotable);
notableRoutes.get('/:id', { summary: 'One biography', schema: v.idSchema }, c.getNotable);
export const adminNotableRoutes = defineRoutes('/admin/notable-persons', 'Admin · People');
registerContentRoutes(adminNotableRoutes, c.admin, { permission: 'content.manage', noun: 'notable person', body: v.adminBody, filters: v.adminFilters });
