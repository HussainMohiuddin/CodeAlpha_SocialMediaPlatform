/**
 * Runs a real local MongoDB server (no Docker or system install required) on
 * 127.0.0.1:27018, with data persisted to backend/.mongo-data so it survives
 * restarts. Uses a different port than other CodeAlpha projects so both can
 * run at the same time.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, '..', '.mongo-data');
fs.mkdirSync(dbPath, { recursive: true });

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27018,
      dbPath,
      storageEngine: 'wiredTiger',
    },
  });

  console.log(`Local MongoDB running at ${mongod.getUri()}`);
  console.log('Press Ctrl+C to stop.');

  const shutdown = async () => {
    console.log('\nStopping local MongoDB...');
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start local MongoDB:', err);
  process.exit(1);
});
