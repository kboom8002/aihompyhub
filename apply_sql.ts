import { Client } from 'pg';
import fs from 'fs';
import 'dotenv/config';

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('No DATABASE_URL');
  const client = new Client({ connectionString });
  await client.connect();
  const sql = fs.readFileSync('./packages/database/src/migrations/11_tenant_analytics.sql', 'utf8');
  await client.query(sql);
  console.log('Migration 11 applied');
  await client.end();
}
run();
