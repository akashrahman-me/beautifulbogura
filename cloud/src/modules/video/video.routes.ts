import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './video.controller';
import * as v from './video.validator';

export const videoRoutes = defineRoutes('/videos', 'Media');
videoRoutes.get('/', { summary: 'Published videos, newest first (?category)', schema: v.listSchema }, c.listVideos);
export const adminVideoRoutes = defineRoutes('/admin/videos', 'Admin · Media');
registerContentRoutes(adminVideoRoutes, c.admin, { permission: 'content.manage', noun: 'video', body: v.adminBody, filters: v.adminFilters });
