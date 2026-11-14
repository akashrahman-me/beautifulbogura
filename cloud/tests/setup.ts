/**
 * Test environment: set before any app module is imported (config/env.ts reads process.env once).
 * Each test file gets its own in-memory replica set, so transactions behave as in production.
 */
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, beforeAll } from 'vitest';

Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://placeholder',
  API_URL: 'http://localhost:4000',
  CLIENT_URL: 'http://localhost:3000',
  CONSOLE_URL: 'http://localhost:3001',
  JWT_ACCESS_SECRET: 'test-access-secret-test-access-secret-0001',
  JWT_REFRESH_SECRET: 'test-refresh-secret-test-refresh-secret-01',
  OAUTH_STATE_SECRET: 'test-state-secret-test-state-secret-000001',
  COOKIE_SECURE: 'false',
  AUTH_DEV_LOGIN: 'true',
  ADMIN_EMAILS: 'owner@example.com',
  UPLOAD_DIR: '.data/test-uploads',
  LOG_LEVEL: 'silent',
});

let rs: MongoMemoryReplSet;

beforeAll(async () => {
  rs = await MongoMemoryReplSet.create({ binary: { version: '8.2.6' }, replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(rs.getUri('test'));
  await mongoose.connection.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await rs?.stop();
});
