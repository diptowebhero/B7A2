import { AppError } from './AppError';
import { StatusCodes } from 'http-status-codes';
import { IssueStatus, IssueType, UserRole } from '../types';

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isUserRole = (role: string): role is UserRole => {
  return role === 'contributor' || role === 'maintainer';
};

export const isIssueType = (type: string): type is IssueType => {
  return type === 'bug' || type === 'feature_request';
};

export const isIssueStatus = (status: string): status is IssueStatus => {
  return status === 'open' || status === 'in_progress' || status === 'resolved';
};

export const parsePositiveInteger = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid id parameter');
  }
  return parsed;
};
