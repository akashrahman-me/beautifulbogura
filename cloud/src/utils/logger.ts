import pino from 'pino';
import { env, isProd, isTest } from '@/config/env';

export const logger = pino({
  level: isTest ? 'silent' : env.LOG_LEVEL,
  // Never log secrets, tokens or cookies.
  redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]', '*.password', '*.token', '*.accessToken', '*.refreshToken'],
  ...(!isProd && !isTest && { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
});
