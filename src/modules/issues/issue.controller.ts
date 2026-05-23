import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { parsePositiveInteger } from '../../utils/validators';
import {
  createIssue,
  deleteIssue,
  getIssueById,
  getIssues,
  updateIssue,
  updateIssueStatus,
} from './issue.service';
import { IssueQuery } from './issue.types';

const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }
  return req.user;
};

export const createIssueController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = getAuthenticatedUser(req);
  const issue = await createIssue(req.body as Record<string, unknown>, user.id);
  sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
});

export const getAllIssuesController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const issues = await getIssues(req.query as Partial<IssueQuery>);
  sendSuccess(res, StatusCodes.OK, null, issues);
});

export const getSingleIssueController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const issueId = parsePositiveInteger(req.params.id as string);
  const issue = await getIssueById(issueId);
  sendSuccess(res, StatusCodes.OK, null, issue);
});

export const updateIssueController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = getAuthenticatedUser(req);
  const issueId = parsePositiveInteger(req.params.id as string);
  const issue = await updateIssue(issueId, req.body as Record<string, unknown>, user);
  sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', issue);
});

export const updateIssueStatusController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const issueId = parsePositiveInteger(req.params.id as string);
  const status = (req.body as { status?: unknown }).status;
  const issue = await updateIssueStatus(issueId, status);
  sendSuccess(res, StatusCodes.OK, 'Issue status updated successfully', issue);
});

export const deleteIssueController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const issueId = parsePositiveInteger(req.params.id as string);
  await deleteIssue(issueId);
  sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
});
