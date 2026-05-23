import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string | null,
  data?: T
): void => {
  const body: { success: true; message?: string; data?: T } = { success: true };

  if (message) body.message = message;
  if (data !== undefined) body.data = data;

  res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  });
};
