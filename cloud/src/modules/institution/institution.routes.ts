import { writeLimiter } from '@/middlewares/rateLimiter';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './institution.controller';
import * as v from './institution.validator';

export const institutionRoutes = defineRoutes('/institutions', 'Education');
institutionRoutes.get('/', { summary: 'Institutions (?type), with map coordinates', schema: v.listInstitutionsSchema }, c.listInstitutions);
institutionRoutes.get('/:id', { summary: 'One institution', schema: v.institutionIdSchema }, c.getInstitution);
institutionRoutes.post('/', { summary: 'Submit an institution (reviewed)', auth: 'optional', schema: v.submitInstitutionSchema, use: [writeLimiter], status: 201 }, c.submitInstitution);
institutionRoutes.post('/:id/claims', { summary: 'Claim an institution (reviewed)', auth: 'optional', schema: v.claimSchema, use: [writeLimiter], status: 201 }, c.submitClaim);

export const adminInstitutionRoutes = defineRoutes('/admin/institutions', 'Admin · Education');
registerContentRoutes(adminInstitutionRoutes, c.admin, { permission: 'content.manage', noun: 'institution', body: v.adminBody, filters: v.adminFilters });
