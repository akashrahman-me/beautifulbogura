import { writeLimiter } from '@/middlewares/rateLimiter';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './announcement.controller';
import * as v from './announcement.validator';

export const homeRoutes = defineRoutes('/home', 'Site');
homeRoutes.get('/slides', { summary: 'Home slides showing now' }, c.liveSlides);

export const pushRoutes = defineRoutes('/push', 'Site');
pushRoutes.get('/key', { summary: 'VAPID public key (null when push is off)' }, c.vapidKey);
pushRoutes.post('/subscriptions', { summary: 'Save this browser for notifications', schema: v.subscribeSchema, use: [writeLimiter], status: 201 }, c.subscribe);
pushRoutes.delete('/subscriptions', { summary: 'Stop notifications for this browser', schema: v.unsubscribeSchema, status: 204 }, c.unsubscribe);

export const adminSlideRoutes = defineRoutes('/admin/slides', 'Admin · Announcements');
registerContentRoutes(adminSlideRoutes, c.adminSlides, { permission: 'announcements.manage', noun: 'slide', body: v.slideBody });

export const adminPushRoutes = defineRoutes('/admin/push', 'Admin · Announcements');
adminPushRoutes.get('/', { summary: 'Sent notifications', permission: 'announcements.manage', schema: v.pushListSchema }, c.listPush);
adminPushRoutes.post('/', { summary: 'Send now (cannot be recalled)', permission: 'announcements.manage', schema: v.sendPushSchema, status: 201 }, c.sendPush);
