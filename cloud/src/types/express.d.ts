import type { StaffRole } from '@/config/permissions';

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` / `optionalAuth`. `role` is null for public users. */
      user?: { id: string; role: StaffRole | null; app: 'site' | 'console'; banned: boolean };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each route's Zod schema types it at the controller
      validated: { body: any; query: any; params: any };
      id: string;
    }
  }
}
export {};
