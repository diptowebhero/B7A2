import { StatusCodes } from 'http-status-codes';
import { query } from '../../config/db';
import { Issue, IssueStatus, IssueType, IssueWithReporter, JwtPayloadData, UserRole } from '../../types';
import { AppError } from '../../utils/AppError';
import { isIssueStatus, isIssueType } from '../../utils/validators';
import { CreateIssueBody, IssueQuery, UpdateIssueBody } from './issue.types';

interface ReporterRow {
  id: number;
  name: string;
  role: UserRole;
}

const issueFields = 'id, title, description, type, status, reporter_id, created_at, updated_at';

const validateTitle = (title: unknown): string => {
  if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 150) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Title is required and must be at most 150 characters');
  }
  return title.trim();
};

const validateDescription = (description: unknown): string => {
  if (typeof description !== 'string' || description.trim().length < 20) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Description is required and must be at least 20 characters');
  }
  return description.trim();
};

const validateIssueType = (type: unknown): IssueType => {
  if (typeof type !== 'string' || !isIssueType(type)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request');
  }
  return type;
};

const validateIssueStatus = (status: unknown): IssueStatus => {
  if (typeof status !== 'string' || !isIssueStatus(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Status must be open, in_progress, or resolved');
  }
  return status;
};

const attachReporters = async (issues: Issue[]): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];

  const reporterIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));
  const reportersResult = await query<ReporterRow>(
    'SELECT id, name, role FROM users WHERE id = ANY($1::int[])',
    [reporterIds]
  );

  const reporterMap = new Map<number, ReporterRow>();
  reportersResult.rows.forEach((reporter) => reporterMap.set(reporter.id, reporter));

  return issues.map((issue) => {
    const reporter = reporterMap.get(issue.reporter_id) ?? null;
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
};

export const createIssue = async (
  body: Partial<CreateIssueBody>,
  reporterId: number
): Promise<Issue> => {
  const title = validateTitle(body.title);
  const description = validateDescription(body.description);
  const type = validateIssueType(body.type);

  const reporterExists = await query<ReporterRow>('SELECT id, name, role FROM users WHERE id = $1', [reporterId]);
  if (!reporterExists.rows[0]) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Authenticated user does not exist');
  }

  const result = await query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING ${issueFields}`,
    [title, description, type, reporterId]
  );

  return result.rows[0];
};

export const getIssues = async (
  queryParams: Partial<IssueQuery>
): Promise<IssueWithReporter[]> => {
  const sort = queryParams.sort ?? 'newest';

  if (sort !== 'newest' && sort !== 'oldest') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Sort must be newest or oldest');
  }

  const whereClauses: string[] = [];
  const values: unknown[] = [];

  if (queryParams.type) {
    const type = validateIssueType(queryParams.type);
    values.push(type);
    whereClauses.push(`type = $${values.length}`);
  }

  if (queryParams.status) {
    const status = validateIssueStatus(queryParams.status);
    values.push(status);
    whereClauses.push(`status = $${values.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const orderDirection = sort === 'oldest' ? 'ASC' : 'DESC';

  const result = await query<Issue>(
    `SELECT ${issueFields}
     FROM issues
     ${whereSql}
     ORDER BY created_at ${orderDirection}, id ${orderDirection}`,
    values
  );

  return attachReporters(result.rows);
};

export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const result = await query<Issue>(`SELECT ${issueFields} FROM issues WHERE id = $1`, [id]);
  const issue = result.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }

  const [issueWithReporter] = await attachReporters([issue]);
  return issueWithReporter;
};

export const updateIssue = async (
  id: number,
  body: Partial<UpdateIssueBody>,
  user: JwtPayloadData
): Promise<Issue> => {
  const existingResult = await query<Issue>(`SELECT ${issueFields} FROM issues WHERE id = $1`, [id]);
  const existingIssue = existingResult.rows[0];

  if (!existingIssue) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }

  const isMaintainer = user.role === 'maintainer';
  const isOwner = existingIssue.reporter_id === user.id;

  if (!isMaintainer && !isOwner) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can update only your own issue');
  }

  if (!isMaintainer && existingIssue.status !== 'open') {
    throw new AppError(StatusCodes.CONFLICT, 'Contributors can update only open issues');
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) {
    values.push(validateTitle(body.title));
    updates.push(`title = $${values.length}`);
  }

  if (body.description !== undefined) {
    values.push(validateDescription(body.description));
    updates.push(`description = $${values.length}`);
  }

  if (body.type !== undefined) {
    values.push(validateIssueType(body.type));
    updates.push(`type = $${values.length}`);
  }

  if (body.status !== undefined) {
    if (!isMaintainer) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only maintainers can change issue status');
    }
    values.push(validateIssueStatus(body.status));
    updates.push(`status = $${values.length}`);
  }

  if (updates.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'At least one valid field is required for update');
  }

  values.push(id);
  const result = await query<Issue>(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING ${issueFields}`,
    values
  );

  return result.rows[0];
};

export const updateIssueStatus = async (
  id: number,
  status: unknown
): Promise<Issue> => {
  const validStatus = validateIssueStatus(status);
  const result = await query<Issue>(
    `UPDATE issues SET status = $1 WHERE id = $2 RETURNING ${issueFields}`,
    [validStatus, id]
  );

  if (!result.rows[0]) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }

  return result.rows[0];
};

export const deleteIssue = async (id: number): Promise<void> => {
  const result = await query<Issue>('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);

  if (!result.rows[0]) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }
};
