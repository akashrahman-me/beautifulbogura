import { writeLimiter } from '@/middlewares/rateLimiter';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './worker.controller';
import * as v from './worker.validator';

export const workerRoutes = defineRoutes('/workers', 'Workers');
workerRoutes.get('/', { summary: 'Skilled workers (?trade)', schema: v.listWorkersSchema }, c.listWorkers);
workerRoutes.post('/', { summary: 'Register yourself (409 WORKER_EXISTS)', schema: v.registerWorkerSchema, use: [writeLimiter], status: 201 }, c.registerWorker);

export const adminWorkerRoutes = defineRoutes('/admin/workers', 'Admin · Workers');
registerContentRoutes(adminWorkerRoutes, c.admin, { permission: 'content.manage', noun: 'worker', body: v.adminBody, filters: v.adminFilters });
