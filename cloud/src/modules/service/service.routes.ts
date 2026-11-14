import type { Request, Response } from 'express';
import { z } from 'zod';
import { defineRoutes } from '@/utils/defineRoutes';
import { sendResponse } from '@/utils/sendResponse';
import * as serviceService from './service.service';

const popular = async (_req: Request, res: Response) => sendResponse(res, { message: 'Popular services', data: await serviceService.popular() });
const view = async (req: Request, res: Response) => {
  await serviceService.recordView(req.validated.params.slug);
  res.status(204).send();
};

export const serviceRoutes = defineRoutes('/services', 'Site');
serviceRoutes.get('/popular', { summary: 'Service slugs by all-time opens' }, popular);
serviceRoutes.post('/:slug/views', { summary: 'Count one open of a service tile', schema: z.object({ params: z.object({ slug: z.string().regex(/^[a-z0-9-]{2,40}$/) }) }), status: 204 }, view);
