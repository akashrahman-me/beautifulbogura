import { createResource } from '@/lib/resource';
import type { ReasonInput } from '@/types/api';
import type { Submission, SubmissionQuery } from '../schemas/review.schema';

export const submissions = createResource<Submission, never, SubmissionQuery>('/admin/submissions', 'জমা দেওয়া তথ্য');

export const useApprove = () => submissions.useAction<{ data?: Record<string, unknown> }>('approve', 'অনুমোদন দেওয়া হয়েছে — সাইটে প্রকাশিত');
export const useReject = () => submissions.useAction<ReasonInput>('reject', 'বাতিল করা হয়েছে');
