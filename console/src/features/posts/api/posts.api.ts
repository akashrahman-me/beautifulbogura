import { createResource } from '@/lib/resource';
import type { ReasonInput } from '@/types/api';
import type { AdminPost, PostQuery } from '../schemas/post.schema';

export const posts = createResource<AdminPost, never, PostQuery>('/admin/posts', 'পোস্ট');

export const useFeature = () => posts.useAction<{ value: boolean }>('feature', (b) => (b.value ? 'ফিচার্ড করা হয়েছে' : 'ফিচার্ড থেকে সরানো হয়েছে'));
export const useVerify = () => posts.useAction<{ value: boolean }>('verify', (b) => (b.value ? 'যাচাইকৃত চিহ্ন দেওয়া হয়েছে' : 'যাচাইকৃত চিহ্ন সরানো হয়েছে'));
export const useExtend = () => posts.useAction<{ days: number }>('extend', 'মেয়াদ বাড়ানো হয়েছে');
export const useRemovePost = () => posts.useAction<ReasonInput>('remove', 'পোস্ট সরানো হয়েছে');
export const useRestorePost = () => posts.useAction('restore', 'পোস্ট ফিরিয়ে আনা হয়েছে');
