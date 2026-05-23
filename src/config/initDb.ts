import fs from 'fs/promises';
import path from 'path';
import { pool } from './db';

const initDb = async (): Promise<void> => {
  const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf-8');
  await pool.query(schema);
  await pool.end();
  console.log('Database initialized successfully');
};

void initDb().catch(async (error: unknown) => {
  console.error('Database initialization failed:', error);
  await pool.end();
  process.exit(1);
});
