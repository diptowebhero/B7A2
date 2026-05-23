import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const query = async <T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};
