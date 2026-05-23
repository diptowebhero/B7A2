import { IssueStatus, IssueType } from '../../types';

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface IssueQuery {
  sort?: 'newest' | 'oldest';
  type?: IssueType;
  status?: IssueStatus;
}
