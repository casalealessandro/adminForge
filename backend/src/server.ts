import { app } from './app.js';
import { config } from './config.js';
import { db } from './db.js';

const server = app.listen(config.port, () => {
  console.log(`AdminForge API listening on http://localhost:${config.port}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down AdminForge API.`);
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
