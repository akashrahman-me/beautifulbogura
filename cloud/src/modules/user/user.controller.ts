import type { Request, Response } from 'express';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import * as userService from './user.service';

export const listUsers = async (req: Request, res: Response) => {
  const { items, meta } = await userService.adminListUsers(req.validated.query);
  sendResponse(res, { message: 'Users fetched', data: items, meta });
};
export const getUser = async (req: Request, res: Response) => sendResponse(res, { message: 'User fetched', data: await userService.adminGetUser(req.validated.params.id) });
export const banUser = async (req: Request, res: Response) => sendResponse(res, { message: 'নিষিদ্ধ করা হয়েছে', data: await userService.banUser(req.validated.params.id, req.validated.body.reason, await actorOf(req)) });
export const unbanUser = async (req: Request, res: Response) => sendResponse(res, { message: 'নিষেধাজ্ঞা তুলে নেওয়া হয়েছে', data: await userService.unbanUser(req.validated.params.id, await actorOf(req)) });
