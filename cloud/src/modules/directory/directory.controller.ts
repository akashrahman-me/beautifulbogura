import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as directoryService from './directory.service';

export const listDirectory = async (req: Request, res: Response) => {
  const { items, meta } = await directoryService.listPublic(req.validated.params.type, req.validated.query);
  sendResponse(res, { message: 'Directory fetched', data: items, meta });
};
export const submitEntry = async (req: Request, res: Response) =>
  sendResponse(res, { statusCode: 201, message: 'অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে', data: await directoryService.submitEntry(req.validated.params.type, req.validated.body, req.user?.id) });
export const rateEntry = async (req: Request, res: Response) =>
  sendResponse(res, { message: 'রেটিং দেওয়ার জন্য ধন্যবাদ', data: await directoryService.rate(req.validated.params.type, req.validated.params.id, req.validated.body.stars) });

export const admin = contentController(directoryService.admin, 'Directory entry');
