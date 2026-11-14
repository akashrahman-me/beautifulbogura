import type { Request, Response } from 'express';
import { z } from 'zod';
import { defineRoutes } from '@/utils/defineRoutes';
import { sendResponse } from '@/utils/sendResponse';
import * as searchService from './search.service';

const q = z.object({ query: z.object({ q: z.string().trim().max(100).default('') }) });

const searchPublic = async (req: Request, res: Response) => {
  const term = req.validated.query.q as string;
  sendResponse(res, { message: 'Search', data: term.length < 2 ? [] : await searchService.searchPublic(term) });
};
const searchAdmin = async (req: Request, res: Response) => {
  const term = req.validated.query.q as string;
  sendResponse(res, { message: 'Search', data: term.length < 2 ? [] : await searchService.searchAdmin(term, req.user!.role) });
};

export const searchRoutes = defineRoutes('/search', 'Site');
searchRoutes.get('/', { summary: 'Doctors, directory, institutions and jobs (?q, 2+ characters)', schema: q }, searchPublic);
export const adminSearchRoutes = defineRoutes('/admin/search', 'Admin · Shell');
adminSearchRoutes.get('/', { summary: 'Command-palette search, limited to what the role may see', permission: 'dashboard.view', schema: q }, searchAdmin);
