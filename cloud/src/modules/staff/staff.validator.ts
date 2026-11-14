import { z } from 'zod';
import { ROLES } from '@/config/permissions';
import { idParams, objectId } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listStaffSchema = z.object({ query: listQuery(200, 100) });
export const inviteSchema = z.object({ body: z.object({ email: z.email('সঠিক ইমেইল দিন'), role: z.enum(ROLES) }) });
export const roleSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ role: z.enum(ROLES) }) });
export const staffIdSchema = idParams;
