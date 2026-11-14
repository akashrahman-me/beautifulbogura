import { writeLimiter } from '@/middlewares/rateLimiter';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './donor.controller';
import * as v from './donor.validator';

export const donorRoutes = defineRoutes('/donors', 'Blood bank');
donorRoutes.get('/stats', { summary: 'Totals by group and readiness' }, c.donorStats);
donorRoutes.get('/', { summary: 'Donors, ready first (?group, ?status)', schema: v.listDonorsSchema }, c.listDonors);
donorRoutes.post('/', { summary: 'Register as a donor (409 DONOR_EXISTS)', schema: v.registerDonorSchema, use: [writeLimiter], status: 201 }, c.registerDonor);
donorRoutes.patch('/:id/last-donation', { summary: 'Update last donation — phone must match (403 PHONE_MISMATCH)', schema: v.lastDonationSchema, use: [writeLimiter] }, c.updateLastDonation);

export const adminDonorRoutes = defineRoutes('/admin/donors', 'Admin · Donors');
registerContentRoutes(adminDonorRoutes, c.admin, { permission: 'content.manage', noun: 'donor', body: v.adminBody, filters: v.adminFilters });
