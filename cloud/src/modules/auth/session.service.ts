import { SessionModel } from './session.model';

/** Sign someone out everywhere (ban, staff removal). `app` limits it to the site or the console. */
export const revokeAllSessions = async (userId: string, app?: 'site' | 'console') => {
  await SessionModel.updateMany({ user: userId, revokedAt: null, ...(app && { app }) }, { revokedAt: new Date() });
};
