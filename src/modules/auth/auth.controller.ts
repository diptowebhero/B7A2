import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { loginUser, signupUser } from './auth.service';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await signupUser(req.body as Record<string, unknown>);
  sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', user);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await loginUser(req.body as Record<string, unknown>);
  sendSuccess(res, StatusCodes.OK, 'Login successful', data);
});
