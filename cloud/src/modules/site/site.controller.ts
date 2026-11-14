import type { Request, Response } from 'express';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import type { DocKey } from './site.defaults';
import * as siteService from './site.service';

export const publicSettings = async (_req: Request, res: Response) => sendResponse(res, { message: 'Settings', data: await siteService.publicSettings() });
export const publicNotice = async (_req: Request, res: Response) => sendResponse(res, { message: 'Site notice', data: await siteService.publicNotice() });

/** GET / PUT controllers for one document key. */
export const docControllers = (key: DocKey) => ({
  get: async (_req: Request, res: Response) => sendResponse(res, { message: 'Document', data: await siteService.getDoc(key) }),
  put: async (req: Request, res: Response) => sendResponse(res, { message: 'সংরক্ষণ করা হয়েছে', data: await siteService.putDoc(key, req.validated.body, await actorOf(req)) }),
});
