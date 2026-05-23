import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';
import { JwtPayloadData, UserRole } from '../types';
import { AppError } from '../utils/AppError';

interface DecodedToken extends JwtPayloadData {
  iat: number;
  exp: number;
}

const extractToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme === 'Bearer' && token) return token;

  return authorizationHeader;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    next(new AppError(StatusCodes.UNAUTHORIZED, 'Authorization token is required'));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as DecodedToken;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch {
    next(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
};
