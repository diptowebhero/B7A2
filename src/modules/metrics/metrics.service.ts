import { query } from '../../config/db';

interface CountRow {
  count: string;
}

interface GroupCountRow {
  label: string;
  count: string;
}

export interface SystemMetrics {
  total_users: number;
  total_issues: number;
  issues_by_status: Record<string, number>;
  issues_by_type: Record<string, number>;
}

const toNumber = (value: string): number => Number(value);

export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const usersResult = await query<CountRow>('SELECT COUNT(*) AS count FROM users');
  const issuesResult = await query<CountRow>('SELECT COUNT(*) AS count FROM issues');
  const statusResult = await query<GroupCountRow>('SELECT status AS label, COUNT(*) AS count FROM issues GROUP BY status');
  const typeResult = await query<GroupCountRow>('SELECT type AS label, COUNT(*) AS count FROM issues GROUP BY type');

  return {
    total_users: toNumber(usersResult.rows[0].count),
    total_issues: toNumber(issuesResult.rows[0].count),
    issues_by_status: Object.fromEntries(statusResult.rows.map((row) => [row.label, toNumber(row.count)])),
    issues_by_type: Object.fromEntries(typeResult.rows.map((row) => [row.label, toNumber(row.count)])),
  };
};
