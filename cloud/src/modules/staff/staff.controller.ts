import type { Request, Response } from 'express';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import * as staffService from './staff.service';

export const listStaff = async (req: Request, res: Response) => {
  const { items, meta } = await staffService.listStaff(req.validated.query.page, req.validated.query.limit);
  sendResponse(res, { message: 'Staff fetched', data: items, meta });
};
export const inviteStaff = async (req: Request, res: Response) => {
  const data = await staffService.invite(req.validated.body.email, req.validated.body.role, await actorOf(req));
  sendResponse(res, { statusCode: 201, message: 'Invitation created', data });
};
export const changeRole = async (req: Request, res: Response) => {
  sendResponse(res, { message: 'Role changed', data: await staffService.changeRole(req.validated.params.id, req.validated.body.role, await actorOf(req)) });
};
export const resendInvite = async (req: Request, res: Response) => {
  sendResponse(res, { message: 'Invitation renewed', data: await staffService.resendInvite(req.validated.params.id, await actorOf(req)) });
};
export const removeStaff = async (req: Request, res: Response) => {
  await staffService.removeStaff(req.validated.params.id, await actorOf(req));
  res.status(204).send();
};
export const restoreStaff = async (req: Request, res: Response) => {
  sendResponse(res, { message: 'Staff restored', data: await staffService.restoreStaff(req.validated.params.id, await actorOf(req)) });
};
