import type { Request, Response } from 'express';
import { contentController } from '@/utils/content';
import { sendResponse } from '@/utils/sendResponse';
import * as doctorService from './doctor.service';

export const listDoctors = async (req: Request, res: Response) => {
  const { items, meta } = await doctorService.listPublic(req.validated.query);
  sendResponse(res, { message: 'Doctors fetched', data: items, meta });
};
export const getDoctor = async (req: Request, res: Response) => sendResponse(res, { message: 'Doctor fetched', data: await doctorService.getPublic(req.validated.params.id) });
export const doctorStats = async (_req: Request, res: Response) => sendResponse(res, { message: 'Doctor stats', data: await doctorService.stats() });
export const submitDoctor = async (req: Request, res: Response) =>
  sendResponse(res, { statusCode: 201, message: 'অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে', data: await doctorService.submitDoctor(req.validated.body, req.user?.id) });

export const admin = contentController(doctorService.admin, 'Doctor');
