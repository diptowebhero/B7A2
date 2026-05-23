import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { issueRoutes } from './modules/issues/issue.routes';
import { metricsRoutes } from './modules/metrics/metrics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/metrics', metricsRoutes);

export const apiRoutes = router;
