import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './submission.controller';
import * as v from './submission.validator';

export const adminSubmissionRoutes = defineRoutes('/admin/submissions', 'Admin · Review');
const permission = 'review.manage';
adminSubmissionRoutes.get('/', { summary: 'Review queue (oldest pending first)', permission, schema: v.listSubmissionsSchema }, c.listSubmissions);
adminSubmissionRoutes.get('/:id', { summary: 'One submission', permission, schema: v.submissionIdSchema }, c.getSubmission);
adminSubmissionRoutes.post('/:id/approve', { summary: 'Publish (optionally with edits)', permission, schema: v.approveSchema }, c.approve);
adminSubmissionRoutes.post('/:id/reject', { summary: 'Reject with a reason shown to the submitter', permission, schema: v.rejectSchema }, c.reject);
