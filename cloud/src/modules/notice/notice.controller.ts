import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as noticeService from './notice.service';

export const listNotices = async (req: Request, res: Response) => {
  const { items, meta } = await noticeService.listPublic(req.validated.query);
  sendResponse(res, { message: 'Notices fetched', data: items, meta });
};
export const admin = contentController(noticeService.admin, 'Notice');
