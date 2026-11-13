import { createResource } from '@/lib/resource';
import type { Institution, InstitutionQuery, Notice, NoticeQuery } from '../schemas/institution.schema';

export const institutions = createResource<Institution, unknown, InstitutionQuery>('/admin/institutions', 'প্রতিষ্ঠানের তথ্য');
export const notices = createResource<Notice, unknown, NoticeQuery>('/admin/notices', 'নোটিশ');
