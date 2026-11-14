import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as areaService from './area.service';

export const profile = async (_req: Request, res: Response) => sendResponse(res, { message: 'Area profile', data: await areaService.profile() });
export const unions = async (_req: Request, res: Response) => sendResponse(res, { message: 'Unions', data: await areaService.listUnions() });
export const administration = async (_req: Request, res: Response) => sendResponse(res, { message: 'Administration', data: await areaService.administration() });
export const municipality = async (_req: Request, res: Response) => sendResponse(res, { message: 'Municipality', data: await areaService.municipality() });
export const adminUnions = contentController(areaService.admin, 'Union');
