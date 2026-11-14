import { writeLimiter } from '@/middlewares/rateLimiter';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './directory.controller';
import * as v from './directory.validator';

export const directoryRoutes = defineRoutes('/directory', 'Directory');
directoryRoutes.get('/:type', { summary: 'Entries of one list (verified first)', schema: v.listPublicSchema }, c.listDirectory);
directoryRoutes.post('/:type', { summary: 'Submit your own entry (reviewed before publishing)', auth: 'optional', schema: v.submitSchema, use: [writeLimiter], status: 201 }, c.submitEntry);
directoryRoutes.post('/:type/:id/rate', { summary: 'Rate 1–5 (restaurants, graphics)', schema: v.rateSchema, use: [writeLimiter] }, c.rateEntry);

export const adminDirectoryRoutes = defineRoutes('/admin/directory', 'Admin · Directory');
registerContentRoutes(adminDirectoryRoutes, c.admin, { permission: 'content.manage', noun: 'directory entry', body: v.adminBody, filters: v.adminFilters });
