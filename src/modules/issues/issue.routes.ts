import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import {
  createIssueController,
  deleteIssueController,
  getAllIssuesController,
  getSingleIssueController,
  updateIssueController,
  updateIssueStatusController,
} from './issue.controller';

const router = Router();

router.get('/', getAllIssuesController);
router.get('/:id', getSingleIssueController);
router.post('/', authenticate, createIssueController);
router.put('/:id', authenticate, updateIssueController);
router.put('/:id/status', authenticate, authorizeRoles('maintainer'), updateIssueStatusController);
router.delete('/:id', authenticate, authorizeRoles('maintainer'), deleteIssueController);

export const issueRoutes = router;
