import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as service from './video.service';

export const listVideos = async (req: Request, res: Response) => {
  const { items, meta } = await service.listPublic(req.validated.query);
  sendResponse(res, { message: 'Videos fetched', data: items, meta });
};
export const admin = contentController(service.admin, 'Video');
