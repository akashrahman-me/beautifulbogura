import { createResource } from '@/lib/resource';
import type { ReasonInput } from '@/types/api';
import type { PublicUser, UserQuery } from '../schemas/user.schema';

export const users = createResource<PublicUser, never, UserQuery>('/admin/users', 'ব্যবহারকারী');

export const useBan = () => users.useAction<ReasonInput>('ban', 'ব্যবহারকারী নিষিদ্ধ হয়েছেন — তাঁর পোস্ট লুকানো হয়েছে');
export const useUnban = () => users.useAction('unban', 'নিষেধাজ্ঞা তুলে নেওয়া হয়েছে');
