import type { Request, Response } from 'express';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import * as reportService from './report.service';

export const listReports = async (req: Request, res: Response) => {
  const { items, meta } = await reportService.listReports(req.validated.query);
  sendResponse(res, { message: 'Reports fetched', data: items, meta });
};
export const getReport = async (req: Request, res: Response) => sendResponse(res, { message: 'Report', data: await reportService.getReport(req.validated.params.id) });
export const dismiss = async (req: Request, res: Response) =>
  sendResponse(res, { message: 'রিপোর্ট খারিজ করা হয়েছে', data: await reportService.dismiss(req.validated.params.id, req.validated.body.reason, await actorOf(req)) });
export const resolve = async (req: Request, res: Response) => sendResponse(res, { message: 'ব্যবস্থা নেওয়া হয়েছে', data: await reportService.resolve(req.validated.params.id, req.validated.body, await actorOf(req)) });
