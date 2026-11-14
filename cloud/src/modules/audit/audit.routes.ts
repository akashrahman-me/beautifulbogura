import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './audit.controller';
import * as v from './audit.validator';

export const adminAuditRoutes = defineRoutes('/admin/audit', 'Admin · Audit');
adminAuditRoutes.get('/', { summary: 'Audit log (newest first)', permission: 'audit.view', schema: v.listAuditSchema }, c.listAudit);
