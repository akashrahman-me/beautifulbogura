import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './report.controller';
import * as v from './report.validator';

export const adminReportRoutes = defineRoutes('/admin/reports', 'Admin · Reports');
const permission = 'reports.manage';
adminReportRoutes.get('/', { summary: 'Report cases, most-reported first (?status, ?kind)', permission, schema: v.listReportsSchema }, c.listReports);
adminReportRoutes.get('/:id', { summary: 'One case', permission, schema: v.reportIdSchema }, c.getReport);
adminReportRoutes.post('/:id/dismiss', { summary: 'Keep the post, close the case', permission, schema: v.dismissSchema }, c.dismiss);
adminReportRoutes.post('/:id/resolve', { summary: 'Remove the post (optionally ban the owner)', permission, schema: v.resolveSchema }, c.resolve);
