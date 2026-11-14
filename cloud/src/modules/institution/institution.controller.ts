import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as institutionService from './institution.service';

export const listInstitutions = async (req: Request, res: Response) => {
  const { items, meta } = await institutionService.listPublic(req.validated.query);
  sendResponse(res, { message: 'Institutions fetched', data: items, meta });
};
export const getInstitution = async (req: Request, res: Response) => sendResponse(res, { message: 'Institution fetched', data: await institutionService.getPublic(req.validated.params.id) });
export const submitInstitution = async (req: Request, res: Response) =>
  sendResponse(res, { statusCode: 201, message: 'অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে', data: await institutionService.submitInstitution(req.validated.body, req.user?.id) });
export const submitClaim = async (req: Request, res: Response) =>
  sendResponse(res, { statusCode: 201, message: 'দাবি জমা হয়েছে', data: await institutionService.submitClaim(req.validated.params.id, req.validated.body, req.user?.id) });
export const admin = contentController(institutionService.admin, 'Institution');
