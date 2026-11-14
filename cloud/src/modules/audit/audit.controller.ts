import type { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import * as auditService from './audit.service';

export const listAudit = async (req: Request, res: Response) => {
  const { items, meta } = await auditService.listAudit(req.validated.query);
  sendResponse(res, { message: 'Audit log fetched', data: items, meta });
};
