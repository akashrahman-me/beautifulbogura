import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as service from './achiever.service';

export const listAchievers = async (req: Request, res: Response) => {
  const { items, meta } = await service.listPublic(req.validated.query);
  sendResponse(res, { message: 'Achievers fetched', data: items, meta });
};
export const admin = contentController(service.admin, 'Achiever');
