import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { getSystemMetrics } from './metrics.service';

export const getMetricsController = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const metrics = await getSystemMetrics();
  sendSuccess(res, StatusCodes.OK, null, metrics);
});
