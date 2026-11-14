import { writeLimiter } from '@/middlewares/rateLimiter';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './doctor.controller';
import * as v from './doctor.validator';

export const doctorRoutes = defineRoutes('/doctors', 'Doctors');
doctorRoutes.get('/stats', { summary: 'Totals, sitting today, by specialty' }, c.doctorStats);
doctorRoutes.get('/', { summary: 'Doctors (?specialty, ?today=true)', schema: v.listDoctorsSchema }, c.listDoctors);
doctorRoutes.get('/:id', { summary: 'One doctor', schema: v.doctorIdSchema }, c.getDoctor);
doctorRoutes.post('/', { summary: 'Submit a doctor (reviewed before publishing)', auth: 'optional', schema: v.submitDoctorSchema, use: [writeLimiter], status: 201 }, c.submitDoctor);

export const adminDoctorRoutes = defineRoutes('/admin/doctors', 'Admin · Doctors');
registerContentRoutes(adminDoctorRoutes, c.admin, { permission: 'content.manage', noun: 'doctor', body: v.adminBody, filters: v.adminFilters });
