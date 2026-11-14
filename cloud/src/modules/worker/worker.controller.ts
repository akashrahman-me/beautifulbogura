import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as workerService from './worker.service';

export const listWorkers = async (req: Request, res: Response) => {
  const { items, meta } = await workerService.listPublic(req.validated.query);
  sendResponse(res, { message: 'Workers fetched', data: items, meta });
};
export const registerWorker = async (req: Request, res: Response) => sendResponse(res, { statusCode: 201, message: 'নিবন্ধন সম্পন্ন হয়েছে', data: await workerService.register(req.validated.body) });
export const admin = contentController(workerService.admin, 'Worker');
