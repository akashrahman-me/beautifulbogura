import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './notice.controller';
import * as v from './notice.validator';

export const noticeRoutes = defineRoutes('/notices', 'Education');
noticeRoutes.get('/', { summary: 'Notices, pinned then newest (?institution)', schema: v.listNoticesSchema }, c.listNotices);

export const adminNoticeRoutes = defineRoutes('/admin/notices', 'Admin · Education');
registerContentRoutes(adminNoticeRoutes, c.admin, { permission: 'content.manage', noun: 'notice', body: v.adminBody, filters: v.adminFilters });
