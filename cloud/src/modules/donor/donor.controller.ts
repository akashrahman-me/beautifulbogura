import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as donorService from './donor.service';

export const listDonors = async (req: Request, res: Response) => {
  const { items, meta } = await donorService.listPublic(req.validated.query);
  sendResponse(res, { message: 'Donors fetched', data: items, meta });
};
export const donorStats = async (_req: Request, res: Response) => sendResponse(res, { message: 'Donor stats', data: await donorService.stats() });
export const registerDonor = async (req: Request, res: Response) => sendResponse(res, { statusCode: 201, message: 'নিবন্ধন সম্পন্ন হয়েছে', data: await donorService.register(req.validated.body) });
export const updateLastDonation = async (req: Request, res: Response) =>
  sendResponse(res, { message: 'তারিখ হালনাগাদ হয়েছে', data: await donorService.updateLastDonation(req.validated.params.id, req.validated.body.phone, req.validated.body.lastDonation) });

export const admin = contentController(donorService.admin, 'Donor');
