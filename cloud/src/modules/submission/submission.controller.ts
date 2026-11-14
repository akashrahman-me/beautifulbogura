import type { Request, Response } from 'express';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import * as submissionService from './submission.service';

export const listSubmissions = async (req: Request, res: Response) => {
  const { items, meta } = await submissionService.listSubmissions(req.validated.query);
  sendResponse(res, { message: 'Submissions fetched', data: items, meta });
};
export const getSubmission = async (req: Request, res: Response) => sendResponse(res, { message: 'Submission fetched', data: await submissionService.getSubmission(req.validated.params.id) });
export const approve = async (req: Request, res: Response) =>
  sendResponse(res, { message: 'অনুমোদন দেওয়া হয়েছে', data: await submissionService.approve(req.validated.params.id, req.validated.body.data, await actorOf(req)) });
export const reject = async (req: Request, res: Response) =>
  sendResponse(res, { message: 'বাতিল করা হয়েছে', data: await submissionService.reject(req.validated.params.id, req.validated.body.reason, await actorOf(req)) });
