import multer from 'multer';
import { lookupLimiter } from '@/middlewares/rateLimiter';
import { ApiError } from '@/errors/ApiError';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './voter.controller';
import * as v from './voter.validator';

const csv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (/\.csv$/i.test(file.originalname) || file.mimetype === 'text/csv' ? cb(null, true) : cb(ApiError.field('file', 'শুধু CSV ফাইল'))),
}).single('file');

export const voterRoutes = defineRoutes('/voters', 'Public service');
voterRoutes.get('/', { summary: 'Voter lookup — needs a 3+ character search, a date of birth or a birth year', schema: v.lookupSchema, use: [lookupLimiter] }, c.lookup);

export const adminVoterRoutes = defineRoutes('/admin/voters', 'Admin · Voters');
const permission = 'voters.manage';
adminVoterRoutes.get('/stats', { summary: 'Totals by union and gender', permission }, c.stats);
adminVoterRoutes.get('/imports', { summary: 'Import history', permission }, c.imports);
adminVoterRoutes.get('/', { summary: 'Search (audited, 3+ characters)', permission, schema: v.adminSearchSchema }, c.adminSearch);
adminVoterRoutes.post('/import', { summary: 'Import a CSV (upsert by voterNo)', permission, use: [csv], status: 201 }, c.importCsv);
