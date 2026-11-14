import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as service from './notable.service';

export const listNotable = async (req: Request, res: Response) => {
  const { items, meta } = await service.listPublic(req.validated.query);
  sendResponse(res, { message: 'Notable persons fetched', data: items, meta });
};
export const getNotable = async (req: Request, res: Response) => sendResponse(res, { message: 'Notable person', data: await service.getPublic(req.validated.params.id) });
export const admin = contentController(service.admin, 'Notable person');
