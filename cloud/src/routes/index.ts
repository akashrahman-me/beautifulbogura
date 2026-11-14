import { Router } from 'express';
import { achieverRoutes, adminAchieverRoutes } from '@/modules/achiever/achiever.routes';
import { adminPushRoutes, adminSlideRoutes, homeRoutes, pushRoutes } from '@/modules/announcement/announcement.routes';
import { adminAreaRoutes, adminUnionRoutes, areaRoutes } from '@/modules/area/area.routes';
import { adminAuditRoutes } from '@/modules/audit/audit.routes';
import { authRoutes } from '@/modules/auth/auth.routes';
import { adminCountsRoutes, adminDashboardRoutes } from '@/modules/dashboard/dashboard.routes';
import { adminDirectoryRoutes, directoryRoutes } from '@/modules/directory/directory.routes';
import { adminDoctorRoutes, doctorRoutes } from '@/modules/doctor/doctor.routes';
import { adminDonorRoutes, donorRoutes } from '@/modules/donor/donor.routes';
import { adminFreedomFighterRoutes, freedomFighterRoutes } from '@/modules/freedom-fighter/freedomFighter.routes';
import { adminInstitutionRoutes, institutionRoutes } from '@/modules/institution/institution.routes';
import { adminNotableRoutes, notableRoutes } from '@/modules/notable/notable.routes';
import { adminNoticeRoutes as adminInstitutionNoticeRoutes, noticeRoutes } from '@/modules/notice/notice.routes';
import { adminPostRoutes, meRoutes, postRoutes } from '@/modules/post/post.routes';
import { adminReportRoutes } from '@/modules/report/report.routes';
import { searchRoutes, adminSearchRoutes } from '@/modules/search/search.routes';
import { serviceRoutes } from '@/modules/service/service.routes';
import { adminNoticeRoutes, adminSettingsRoutes, siteRoutes } from '@/modules/site/site.routes';
import { adminStaffRoutes } from '@/modules/staff/staff.routes';
import { adminSubmissionRoutes } from '@/modules/submission/submission.routes';
import { uploadRoutes } from '@/modules/upload/upload.routes';
import { adminUserRoutes } from '@/modules/user/user.routes';
import { adminVideoRoutes, videoRoutes } from '@/modules/video/video.routes';
import { adminVoterRoutes, voterRoutes } from '@/modules/voter/voter.routes';
import { weatherRoutes } from '@/modules/weather/weather.routes';
import { adminWorkerRoutes, workerRoutes } from '@/modules/worker/worker.routes';
import type { ModuleRoutes } from '@/utils/defineRoutes';

/** Public API used by the site (client/). */
const PUBLIC: ModuleRoutes[] = [
  authRoutes, meRoutes, uploadRoutes, siteRoutes, homeRoutes, pushRoutes, weatherRoutes, serviceRoutes, searchRoutes,
  doctorRoutes, donorRoutes, directoryRoutes, workerRoutes, institutionRoutes, noticeRoutes, areaRoutes,
  freedomFighterRoutes, notableRoutes, achieverRoutes, videoRoutes, voterRoutes, ...postRoutes,
];

/** Staff API used by the console (console/). More specific bases first (/admin/area/unions before /admin/area). */
const ADMIN: ModuleRoutes[] = [
  adminCountsRoutes, adminDashboardRoutes, adminSearchRoutes, adminSubmissionRoutes, adminReportRoutes, adminPostRoutes, adminUserRoutes,
  adminDirectoryRoutes, adminDoctorRoutes, adminDonorRoutes, adminWorkerRoutes, adminInstitutionRoutes, adminInstitutionNoticeRoutes,
  adminUnionRoutes, adminAreaRoutes, adminFreedomFighterRoutes, adminNotableRoutes, adminAchieverRoutes, adminVideoRoutes, adminSlideRoutes,
  adminNoticeRoutes, adminPushRoutes, adminVoterRoutes, adminStaffRoutes, adminAuditRoutes, adminSettingsRoutes,
];

const router = Router();
for (const m of [...PUBLIC, ...ADMIN]) router.use(m.base, m.router);
export default router;
