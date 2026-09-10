import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const here = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(resolve(here, '../sql/schema.sql'), 'utf8');
const seed = await readFile(resolve(here, '../sql/seed.sql'), 'utf8');
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query('BEGIN');
  await client.query(schema);
  await client.query(seed);
  await client.query('COMMIT');
  console.log('AdminForge database initialized and seeded.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
