import type { Request, Response } from 'express';
import { actorOf } from '@/utils/actor';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as service from './announcement.service';

export const liveSlides = async (_req: Request, res: Response) => sendResponse(res, { message: 'Slides', data: await service.liveSlides() });
export const vapidKey = async (_req: Request, res: Response) => sendResponse(res, { message: 'Push key', data: { publicKey: service.vapidKey() } });
export const subscribe = async (req: Request, res: Response) => sendResponse(res, { statusCode: 201, message: 'নোটিফিকেশন চালু হয়েছে', data: await service.subscribe(req.validated.body) });
export const unsubscribe = async (req: Request, res: Response) => {
  await service.unsubscribe(req.validated.body.endpoint);
  res.status(204).send();
};
export const listPush = async (req: Request, res: Response) => {
  const { items, meta } = await service.listPush(req.validated.query.page, req.validated.query.limit);
  sendResponse(res, { message: 'Push history', data: items, meta });
};
export const sendPush = async (req: Request, res: Response) => sendResponse(res, { statusCode: 201, message: 'নোটিফিকেশন পাঠানো হয়েছে', data: await service.sendPush(req.validated.body, await actorOf(req)) });
export const adminSlides = contentController(service.admin, 'Slide');
