import { z } from 'zod';
import { idParams, objectId, reasonBody } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';
import { AUTH_PROVIDERS } from './user.model';

export const listUsersSchema = z.object({ query: listQuery(100).extend({ status: z.enum(['active', 'banned']).optional(), provider: z.enum(AUTH_PROVIDERS).optional() }) });
export const userIdSchema = idParams;
export const banSchema = z.object({ params: z.object({ id: objectId }), body: reasonBody });
