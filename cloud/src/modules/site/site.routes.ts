import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './site.controller';
import * as v from './site.validator';

export const siteRoutes = defineRoutes('/site', 'Site');
siteRoutes.get('/settings', { summary: 'Public settings: contact, social links, posting rules, maintenance' }, c.publicSettings);
siteRoutes.get('/notice', { summary: 'The site-wide notice bar, or null' }, c.publicNotice);

export const adminSettingsRoutes = defineRoutes('/admin/settings', 'Admin · Settings');
const settings = c.docControllers('site.settings');
adminSettingsRoutes.get('/', { summary: 'Site settings', permission: 'settings.manage' }, settings.get);
adminSettingsRoutes.put('/', { summary: 'Replace site settings', permission: 'settings.manage', schema: v.settingsSchema }, settings.put);

export const adminNoticeRoutes = defineRoutes('/admin/site-notice', 'Admin · Announcements');
const notice = c.docControllers('site.notice');
adminNoticeRoutes.get('/', { summary: 'Site notice', permission: 'announcements.manage' }, notice.get);
adminNoticeRoutes.put('/', { summary: 'Replace site notice', permission: 'announcements.manage', schema: v.noticeSchema }, notice.put);
