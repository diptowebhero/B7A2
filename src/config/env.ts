import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
  corsOrigin: string;
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

if (!Number.isInteger(saltRounds) || saltRounds < 8 || saltRounds > 12) {
  throw new Error('BCRYPT_SALT_ROUNDS must be an integer between 8 and 12');
}

export const env: EnvConfig = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptSaltRounds: saltRounds,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
