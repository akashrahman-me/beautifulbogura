import type { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import * as uploadService from './upload.service';

export const uploadImages = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  sendResponse(res, { statusCode: 201, message: 'ছবি আপলোড হয়েছে', data: await uploadService.saveImages(files) });
};
