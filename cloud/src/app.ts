import { randomUUID } from 'node:crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env, isProd } from '@/config/env';
import { buildOpenApi } from '@/docs/openapi';
import { errorHandler } from '@/middlewares/errorHandler';
import { notFound } from '@/middlewares/notFound';
import { globalLimiter } from '@/middlewares/rateLimiter';
import { uploadDir } from '@/modules/upload/upload.service';
import routes from '@/routes';
import { logger } from '@/utils/logger';

export const app = express();

// Behind one proxy (load balancer) in production, so req.ip is the visitor's address.
app.set('trust proxy', isProd ? 1 : false);
app.disable('x-powered-by');

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = (req.headers['x-request-id'] as string) || randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    serializers: { req: (req) => ({ id: req.id, method: req.method, url: req.url }) },
  }),
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API docs (not in production): Swagger UI needs its own relaxed headers, so it sits before helmet.
if (!isProd) {
  const spec = buildOpenApi();
  app.get('/api/docs.json', (_req, res) => res.json(spec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

app.use(helmet());
// Both front ends call this API with credentials (the refresh cookie).
app.use(cors({ origin: [env.CLIENT_URL, env.CONSOLE_URL], credentials: true }));
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
// Apple's form_post callback and the development sign-in form.
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

// Uploaded photos: embedded by the site and console on other origins.
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  express.static(uploadDir, { immutable: true, maxAge: '365d', index: false, dotfiles: 'deny', fallthrough: false }),
);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);
