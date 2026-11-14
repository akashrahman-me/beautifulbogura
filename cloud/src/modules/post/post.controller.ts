import type { Request, Response } from 'express';
import type { PostKind } from '@/config/catalog';
import * as reportService from '@/modules/report/report.service';
import { actorOf } from '@/utils/actor';
import { sendResponse } from '@/utils/sendResponse';
import * as postService from './post.service';

/** Controllers bound to one post kind. */
export const forKind = (kind: PostKind) => ({
  list: async (req: Request, res: Response) => {
    const { items, meta } = await postService.listPublic(kind, req.validated.query);
    sendResponse(res, { message: 'Posts fetched', data: items, meta });
  },
  get: async (req: Request, res: Response) => sendResponse(res, { message: 'Post fetched', data: await postService.getPublic(kind, req.validated.params.id) }),
  create: async (req: Request, res: Response) => sendResponse(res, { statusCode: 201, message: 'পোস্ট প্রকাশিত হয়েছে', data: await postService.createPost(kind, req.validated.body, req.user!) }),
  update: async (req: Request, res: Response) => sendResponse(res, { message: 'হালনাগাদ হয়েছে', data: await postService.updateOwn(kind, req.validated.params.id, req.validated.body, req.user!) }),
  manage: async (req: Request, res: Response) => sendResponse(res, { message: 'হালনাগাদ হয়েছে', data: await postService.manageOwn(kind, req.validated.params.id, req.validated.body.action, req.user!.id) }),
  report: async (req: Request, res: Response) =>
    sendResponse(res, { message: 'রিপোর্ট গ্রহণ করা হয়েছে', data: await reportService.addReport(req.validated.params.id, req.validated.body.reason, req.validated.body.note, { ip: req.ip, userId: req.user?.id }) }),
});

export const myPosts = async (req: Request, res: Response) => sendResponse(res, { message: 'My posts', data: await postService.myPosts(req.user!.id) });

export const adminList = async (req: Request, res: Response) => {
  const { items, meta } = await postService.adminList(req.validated.query);
  sendResponse(res, { message: 'Posts fetched', data: items, meta });
};
export const adminGet = async (req: Request, res: Response) => sendResponse(res, { message: 'Post fetched', data: await postService.adminGet(req.validated.params.id) });
export const moderate = (action: 'feature' | 'verify' | 'extend' | 'remove' | 'restore') => async (req: Request, res: Response) =>
  sendResponse(res, { message: 'হালনাগাদ হয়েছে', data: await postService.moderate(req.validated.params.id, action, req.validated.body ?? {}, await actorOf(req)) });
