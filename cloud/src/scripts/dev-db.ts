/**
 * Local MongoDB for development: a single-node replica set (so transactions work) on 127.0.0.1:27017,
 * data kept in .data/db between runs. Uses mongodb-memory-server's cached binary — nothing to install.
 *   npm run db          # leave it running in its own terminal
 * Production uses a real cluster (e.g. MongoDB Atlas) through MONGODB_URI.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

const dbPath = path.resolve('.data/db');
mkdirSync(dbPath, { recursive: true });

const main = async () => {
  const rs = await MongoMemoryReplSet.create({
    binary: { version: process.env.MONGOMS_VERSION ?? '8.2.6' },
    replSet: { name: 'rs0', count: 1, storageEngine: 'wiredTiger' },
    instanceOpts: [{ port: Number(process.env.DEV_DB_PORT ?? 27017), dbPath, storageEngine: 'wiredTiger' }],
  });
  console.log(`MongoDB replica set ready: ${rs.getUri('beautifulbogura')}`);
  console.log('Data directory:', dbPath, '— press Ctrl+C to stop (data is kept).');
  const stop = async () => {
    await rs.stop({ doCleanup: false, force: false });
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
};

void main();
