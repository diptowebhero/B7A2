import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { query } from '../../config/db';
import { env } from '../../config/env';
import { JwtPayloadData, PublicUser, User, UserRole } from '../../types';
import { AppError } from '../../utils/AppError';
import { isValidEmail, isUserRole } from '../../utils/validators';
import { LoginBody, SignupBody } from './auth.types';

const userSelectFields = 'id, name, email, role, created_at, updated_at';

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const validateSignup = (body: Partial<SignupBody>): SignupBody => {
  const errors: Record<string, string> = {};

  if (!body.name || body.name.trim().length < 2) errors.name = 'Name is required';
  if (!body.email || !isValidEmail(body.email)) errors.email = 'Valid email is required';
  if (!body.password || body.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (body.role && !isUserRole(body.role)) errors.role = 'Role must be contributor or maintainer';

  if (Object.keys(errors).length > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', errors);
  }

  return {
    name: body.name!.trim(),
    email: body.email!.trim().toLowerCase(),
    password: body.password!,
    role: body.role ?? 'contributor',
  };
};

const validateLogin = (body: Partial<LoginBody>): LoginBody => {
  const errors: Record<string, string> = {};

  if (!body.email || !isValidEmail(body.email)) errors.email = 'Valid email is required';
  if (!body.password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', errors);
  }

  return {
    email: body.email!.trim().toLowerCase(),
    password: body.password!,
  };
};

const signToken = (payload: JwtPayloadData): string => {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, options);
};

export const signupUser = async (body: Partial<SignupBody>): Promise<PublicUser> => {
  const payload = validateSignup(body);

  const existingUser = await query<User>('SELECT * FROM users WHERE email = $1', [payload.email]);
  if (existingUser.rowCount && existingUser.rowCount > 0) {
    throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, env.bcryptSaltRounds);

  const result = await query<User>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${userSelectFields}, password`,
    [payload.name, payload.email, hashedPassword, payload.role]
  );

  return toPublicUser(result.rows[0]);
};

export const loginUser = async (body: Partial<LoginBody>): Promise<{ token: string; user: PublicUser }> => {
  const payload = validateLogin(body);

  const result = await query<User>('SELECT * FROM users WHERE email = $1', [payload.email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);
  if (!passwordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const publicUser = toPublicUser(user);
  const token = signToken({ id: user.id, name: user.name, role: user.role as UserRole });

  return { token, user: publicUser };
};
