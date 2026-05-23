import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const notFoundHandler = (path: string): AppError => {
  return new AppError(StatusCodes.NOT_FOUND, `Route not found: ${path}`);
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next): void => {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }

  if (env.nodeEnv !== 'production') {
    console.error(error);
  }

  sendError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error');
};
