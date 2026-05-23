import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { getMetricsController } from './metrics.controller';

const router = Router();

router.get('/', authenticate, authorizeRoles('maintainer'), getMetricsController);

export const metricsRoutes = router;
