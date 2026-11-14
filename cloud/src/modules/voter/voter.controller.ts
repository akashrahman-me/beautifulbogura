import type { Request, Response } from 'express';
import { ApiError } from '@/errors/ApiError';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import * as voterService from './voter.service';

export const lookup = async (req: Request, res: Response) => {
  const { items, meta } = await voterService.lookup(req.validated.query);
  sendResponse(res, { message: 'Voters fetched', data: items, meta });
};
export const adminSearch = async (req: Request, res: Response) => {
  const { items, meta } = await voterService.adminSearch(req.validated.query, await actorOf(req));
  sendResponse(res, { message: 'Voters fetched', data: items, meta });
};
export const stats = async (_req: Request, res: Response) => sendResponse(res, { message: 'Voter stats', data: await voterService.stats() });
export const imports = async (_req: Request, res: Response) => sendResponse(res, { message: 'Imports', data: await voterService.listImports() });
export const importCsv = async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.field('file', 'CSV ফাইল দিন');
  sendResponse(res, { statusCode: 201, message: 'ইমপোর্ট সম্পন্ন', data: await voterService.importCsv(req.file, await actorOf(req)) });
};
