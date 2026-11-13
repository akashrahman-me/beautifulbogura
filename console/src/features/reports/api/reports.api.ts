import { createResource } from '@/lib/resource';
import type { ReasonInput } from '@/types/api';
import type { ReportGroup, ReportQuery } from '../schemas/report.schema';

export const reports = createResource<ReportGroup, never, ReportQuery>('/admin/reports', 'রিপোর্ট');

/** Keep the post; close the reports. */
export const useDismiss = () => reports.useAction<Partial<ReasonInput>>('dismiss', 'রিপোর্ট খারিজ করা হয়েছে — পোস্ট থাকছে');
/** Remove the post (and optionally ban its owner); close the reports. */
export const useResolve = () => reports.useAction<ReasonInput & { ban: boolean }>('resolve', (b) => (b.ban ? 'পোস্ট সরানো ও ব্যবহারকারী নিষিদ্ধ হয়েছে' : 'পোস্ট সরানো হয়েছে'));
