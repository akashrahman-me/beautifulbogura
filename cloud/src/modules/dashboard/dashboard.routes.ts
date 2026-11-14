import type { Request, Response } from 'express';
import { defineRoutes } from '@/utils/defineRoutes';
import { sendResponse } from '@/utils/sendResponse';
import * as dashboardService from './dashboard.service';

const counts = async (_req: Request, res: Response) => sendResponse(res, { message: 'Counts', data: await dashboardService.counts() });
const dashboard = async (_req: Request, res: Response) => sendResponse(res, { message: 'Dashboard', data: await dashboardService.dashboard() });

export const adminCountsRoutes = defineRoutes('/admin/counts', 'Admin · Shell');
adminCountsRoutes.get('/', { summary: 'Sidebar badges: pending reviews, open reports', permission: 'dashboard.view' }, counts);
export const adminDashboardRoutes = defineRoutes('/admin/dashboard', 'Admin · Shell');
adminDashboardRoutes.get('/', { summary: 'KPIs, 30-day activity, what needs attention, recent actions', permission: 'dashboard.view' }, dashboard);
