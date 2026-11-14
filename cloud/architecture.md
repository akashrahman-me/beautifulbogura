# REST API Architecture Guide

**Stack:** Node.js · Express 5 · TypeScript · MongoDB (Mongoose) · Zod
**Client:** Next.js / React
**Size:** Medium (roughly 10–40 resources)

---

## 1. Folder Structure (feature-based)

Each feature owns its files. Shared code lives outside the modules.

```
project/
├── src/
│   ├── config/
│   │   ├── env.ts               # Load + validate env vars (Zod), export typed config
│   │   └── db.ts                # Mongoose connect / disconnect
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validator.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.validator.ts
│   │   │   └── user.test.ts
│   │   └── .../
│   │
│   ├── middlewares/
│   │   ├── auth.ts              # authenticate + authorize(...roles)
│   │   ├── validate.ts          # Zod schema runner
│   │   ├── errorHandler.ts      # Global error handler (last middleware)
│   │   ├── notFound.ts          # 404 for unknown routes
│   │   └── rateLimiter.ts
│   │
│   ├── errors/
│   │   └── ApiError.ts          # Operational error class
│   │
│   ├── utils/
│   │   ├── sendResponse.ts      # Success response formatter
│   │   ├── pagination.ts        # page/limit parsing + meta builder
│   │   └── logger.ts            # pino instance
│   │
│   ├── types/
│   │   └── express.d.ts         # Augment Request (req.user, req.validated)
│   │
│   ├── routes/
│   │   └── index.ts             # Mounts every module router under /api/v1
│   │
│   ├── app.ts                   # Builds the Express app (no listen)
│   └── server.ts                # Connects DB, listens, graceful shutdown
│
├── tests/                       # Integration tests + test setup
├── .env.example
├── tsconfig.json
└── package.json
```

**Why feature-based:** everything for "user" is in one folder, so adding or deleting a feature touches one place. Role-based folders (`controllers/`, `services/`, ...) spread one feature across six directories.

---

## 2. Layer Responsibilities

| Layer | Does | Does NOT |
|---|---|---|
| **Routes** | Map URL + method to middleware chain and controller | Contain logic |
| **Validator** | Check request *shape and types* (Zod) | Check business rules |
| **Controller** | Read validated input, call one service method, send response | Touch the database, hold business logic |
| **Service** | Business rules, DB access via models, transactions | Touch `req` / `res` |
| **Model** | Schema, indexes, hooks, statics | Know about HTTP |
| **Middleware** | Auth, validation, rate limiting, logging, errors | Feature-specific logic |

### Validation is split in two

- **Validator (boundary):** "is `email` a valid email string?", "is `id` a valid ObjectId?"
- **Service (business):** "is this email already registered?", "can this user edit this post?"

### Repository layer?

For a medium Mongoose project, services call models directly. Most teams skip a repository layer because Mongoose models already act as one. Add it only if queries get duplicated across services or you need to swap the data source.

---

## 3. Dependency Flow

```
Request
  → global middleware (helmet, cors, json, logger, rate limit)
  → router (/api/v1)
  → authenticate → authorize
  → validate(schema)
  → controller
  → service
  → model → MongoDB
  ← service returns plain data
  ← controller calls sendResponse
Any thrown error → errorHandler → error response
```

Dependencies point one way only: `routes → controller → service → model`. A service never imports a controller; a model never imports a service. A service may call another module's **service**, never its model.

---

## 4. Response Format

The HTTP status line carries the status code. **It is not repeated in the body.**

### Success

```jsonc
// 200 / 201
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "id": "665f...", "name": "Akash" }
}
```

### Success with pagination

```jsonc
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [ /* ... */ ],
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

### Error

```jsonc
// 400 / 401 / 403 / 404 / 409 / 422 / 500
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "path": "email", "message": "Invalid email address" }
  ]
}
```

- `code` is a stable machine-readable string the frontend can switch on (`EMAIL_TAKEN`, `INVALID_CREDENTIALS`, `NOT_FOUND`). `message` is for humans and may change.
- `errors` appears only for validation failures.
- `204 No Content` responses (e.g. delete) have no body.
- `stack` is included only when `NODE_ENV=development`.

### Status codes to use

| Code | When |
|---|---|
| 200 | Successful GET / PATCH / PUT |
| 201 | Resource created |
| 204 | Deleted, nothing to return |
| 400 | Malformed request / validation failed |
| 401 | Not authenticated (missing or invalid token) |
| 403 | Authenticated but not allowed |
| 404 | Resource or route not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limited |
| 500 | Unexpected server error |

---

## 5. Core Building Blocks

### `config/env.ts` — fail fast on bad config

```ts
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url(),          // Next.js origin for CORS
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

Nothing else in the codebase reads `process.env` directly.

### `errors/ApiError.ts`

```ts
export class ApiError extends Error {
  readonly isOperational = true;

  constructor(
    public statusCode: number,
    message: string,
    public code = 'ERROR',
    public errors?: { path: string; message: string }[],
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string, code = 'BAD_REQUEST') { return new ApiError(400, msg, code); }
  static unauthorized(msg = 'Unauthorized', code = 'UNAUTHORIZED') { return new ApiError(401, msg, code); }
  static forbidden(msg = 'Forbidden', code = 'FORBIDDEN') { return new ApiError(403, msg, code); }
  static notFound(msg = 'Not found', code = 'NOT_FOUND') { return new ApiError(404, msg, code); }
  static conflict(msg: string, code = 'CONFLICT') { return new ApiError(409, msg, code); }
}
```

`statusCode` lives on the error object so the handler can set the HTTP status. It never goes into the response body.

### `utils/sendResponse.ts`

```ts
import { Response } from 'express';

interface Payload<T> {
  statusCode?: number;
  message: string;
  data?: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export const sendResponse = <T>(res: Response, { statusCode = 200, message, data, meta }: Payload<T>) =>
  res.status(statusCode).json({ success: true, message, data, meta });
```

### `middlewares/validate.ts`

```ts
import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ApiError } from '../errors/ApiError';

export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });

  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      path: i.path.slice(1).join('.'),
      message: i.message,
    }));
    return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors));
  }

  // Express 5: req.query is read-only, so parsed input goes on req.validated
  req.validated = result.data as typeof req.validated;
  next();
};
```

### `middlewares/errorHandler.ts`

```ts
import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../errors/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    error = new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}`, 'INVALID_ID');
  } else if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    error = ApiError.conflict(`${field} already exists`, 'DUPLICATE_KEY');
  } else if (err?.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');
  } else if (err?.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
  } else {
    // Programming error: log everything, tell the client nothing
    logger.error({ err, path: req.path }, 'Unhandled error');
    error = new ApiError(500, 'Something went wrong', 'INTERNAL_ERROR');
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(error.errors && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### Async errors

Express 5 forwards rejected promises from `async` handlers to the error handler automatically, so no wrapper is needed. On Express 4, wrap every handler:

```ts
export const catchAsync = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

### `app.ts` and `server.ts` (kept separate)

```ts
// app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);        // always last
```

```ts
// server.ts
import { app } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './utils/logger';

const start = async () => {
  await connectDB();
  const server = app.listen(env.PORT, () => logger.info(`Listening on ${env.PORT}`));

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => { logger.fatal(reason); shutdown('unhandledRejection'); });
};

start();
```

Tests import `app` with Supertest and never open a port.

---

## 6. A Complete Module (user)

### `user.model.ts`

```ts
import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export const UserModel = model('User', userSchema);
```

### `user.validator.ts` — schemas are the single source of types

```ts
import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ name: z.string().min(2).max(60) }).partial(),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
  }),
});

export const userIdSchema = z.object({ params: z.object({ id: objectId }) });

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
```

No separate `user.types.ts` needed; add one only for types that don't come from a schema.

### `user.service.ts`

```ts
import bcrypt from 'bcryptjs';
import { UserModel } from './user.model';
import { CreateUserInput, UpdateUserInput, ListUsersQuery } from './user.validator';
import { ApiError } from '../../errors/ApiError';

export const createUser = async (input: CreateUserInput) => {
  if (await UserModel.exists({ email: input.email })) {
    throw ApiError.conflict('Email already registered', 'EMAIL_TAKEN');
  }
  const password = await bcrypt.hash(input.password, 12);
  return UserModel.create({ ...input, password });
};

export const listUsers = async ({ page, limit, search }: ListUsersQuery) => {
  const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
  const [items, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    UserModel.countDocuments(filter),
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getUserById = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  const user = await UserModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
};

export const deleteUser = async (id: string) => {
  const user = await UserModel.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
};
```

### `user.controller.ts`

```ts
import { Request, Response } from 'express';
import * as userService from './user.service';
import { sendResponse } from '../../utils/sendResponse';

export const createUser = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.validated.body);
  sendResponse(res, { statusCode: 201, message: 'User created', data: user });
};

export const listUsers = async (req: Request, res: Response) => {
  const { items, meta } = await userService.listUsers(req.validated.query);
  sendResponse(res, { message: 'Users fetched', data: items, meta });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.validated.params.id);
  sendResponse(res, { message: 'User fetched', data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.validated.params.id, req.validated.body);
  sendResponse(res, { message: 'User updated', data: user });
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.deleteUser(req.validated.params.id);
  res.status(204).send();
};
```

### `user.routes.ts`

```ts
import { Router } from 'express';
import * as c from './user.controller';
import * as v from './user.validator';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);

router.route('/')
  .post(authorize('admin'), validate(v.createUserSchema), c.createUser)
  .get(authorize('admin'), validate(v.listUsersSchema), c.listUsers);

router.route('/:id')
  .get(validate(v.userIdSchema), c.getUser)
  .patch(validate(v.updateUserSchema), c.updateUser)
  .delete(authorize('admin'), validate(v.userIdSchema), c.deleteUser);

export default router;
```

### `routes/index.ts`

```ts
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
export default router;
```

### `types/express.d.ts`

```ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'user' | 'admin' };
      validated: { body: any; query: any; params: any };
    }
  }
}
export {};
```

---

## 7. Authentication (for a Next.js client)

- **Access token:** short-lived JWT (about 15 min), sent as `Authorization: Bearer <token>`.
- **Refresh token:** long-lived, stored in an `httpOnly`, `secure`, `sameSite` cookie; rotated on every refresh; a hash is stored in MongoDB so it can be revoked.
- **Endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.
- **CORS:** `origin: CLIENT_URL` with `credentials: true`; the frontend sends `credentials: 'include'`.
- `authenticate` verifies the token and sets `req.user`. `authorize(...roles)` checks the role. Ownership checks ("is this *my* post?") belong in the service.

---

## 8. MongoDB / Mongoose Conventions

- **Indexes:** declare them in the schema for every field you filter or sort on. Turn off `autoIndex` in production and build indexes deliberately.
- **`.lean()`** on read-only queries that return many documents (faster, plain objects). Note that `toJSON` transforms don't run on lean results.
- **Sensitive fields:** `select: false` on `password`, tokens, etc.
- **Transactions:** use `session.withTransaction()` inside a service when one operation writes to several collections. Requires a replica set (Atlas has one by default).
- **References vs embedding:** embed data that is read together and bounded in size; reference data that is shared or grows without limit.
- **IDs:** validate ObjectIds in the validator so bad ids return 400 before reaching the DB.
- **Schema changes:** use `migrate-mongo` for data migrations rather than ad-hoc scripts.
- **Pagination:** offset (`skip/limit`) is fine for admin tables; use cursor-based (`_id < lastId`) for infinite feeds or large collections.

---

## 9. Naming Conventions

**Files:** `user.controller.ts`, `user.service.ts`, `user.model.ts`, `user.routes.ts`, `user.validator.ts`, `user.test.ts` (singular module folder: `modules/user/`)

**Functions**

| Controller | Service |
|---|---|
| `createUser` | `createUser` |
| `listUsers` | `listUsers` |
| `getUser` | `getUserById` |
| `updateUser` | `updateUser` |
| `deleteUser` | `deleteUser` |

**Routes:** plural nouns, kebab-case, no verbs.

```
POST    /api/v1/users            Create
GET     /api/v1/users            List (?page=1&limit=20&sort=-createdAt&search=...)
GET     /api/v1/users/:id        Get one
PATCH   /api/v1/users/:id        Partial update   (default for updates)
PUT     /api/v1/users/:id        Full replacement (only if truly needed)
DELETE  /api/v1/users/:id        Delete
GET     /api/v1/users/:id/posts  Nested resource (max one level deep)
```

**JSON fields:** camelCase. Expose `id`, not `_id`.

---

## 10. Security

- `helmet` for HTTP headers
- CORS restricted to the Next.js origin
- `express-rate-limit` globally, stricter on `/auth/*`
- Body size limit (`express.json({ limit: '1mb' })`)
- Zod schemas reject unknown shapes, which also blocks NoSQL operator injection (`{ "$gt": "" }`) because fields are typed as strings
- Passwords hashed with bcrypt (cost 12) or argon2
- Secrets only in env vars; `.env` is git-ignored, `.env.example` is committed
- Generic 500 messages in production; details go to the logs

---

## 11. Logging

- `pino` + `pino-http` for structured JSON logs
- A request id per request (`x-request-id`) included in every log line
- Log levels: `error` for failures, `warn` for 4xx spikes or suspicious input, `info` for lifecycle events
- Never log passwords, tokens, or full request bodies

---

## 12. Testing

| Type | Tool | Scope |
|---|---|---|
| Unit | Vitest or Jest | Service functions, utils |
| Integration | Supertest + `mongodb-memory-server` | Route → controller → service → DB |

Integration tests on routes give the most value per test in this architecture. Keep unit tests for services with real branching logic.

---

## 13. Tooling

- `tsx watch src/server.ts` for development, `tsc` for build, `node dist/server.js` in production
- ESLint + Prettier, `strict: true` in `tsconfig.json`
- Path alias (`@/` → `src/`) to avoid `../../../`
- API docs: OpenAPI generated from Zod schemas (`zod-to-openapi`) served with Swagger UI at `/api/docs`
- Husky + lint-staged for pre-commit checks

---

## 14. Checklist

- [ ] Feature-based modules; one-way dependency flow
- [ ] Env validated at startup; no direct `process.env` usage elsewhere
- [ ] `app.ts` / `server.ts` split
- [ ] Zod validation on every endpoint; types inferred from schemas
- [ ] Controllers thin; services free of `req` / `res`
- [ ] Single response format; no status code in the body
- [ ] `ApiError` + global error handler; Mongoose and JWT errors mapped
- [ ] Machine-readable error `code` on every error
- [ ] Access + refresh token auth; role-based `authorize`
- [ ] Helmet, CORS, rate limiting, body limit
- [ ] Pagination with `meta` on every list endpoint
- [ ] Indexes defined; `select: false` on sensitive fields
- [ ] Structured logging with request ids
- [ ] `/health` endpoint; graceful shutdown
- [ ] Integration tests for each module
- [ ] OpenAPI docs

---

## 15. Build Order for a New Module

1. `*.model.ts` — schema + indexes
2. `*.validator.ts` — Zod schemas + inferred types
3. `*.service.ts` — business logic
4. `*.controller.ts` — HTTP glue
5. `*.routes.ts` — wire middleware + controllers
6. Register in `routes/index.ts`
7. `*.test.ts` — integration tests