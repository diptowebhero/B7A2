import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiRoutes } from './routes';
import { sendSuccess } from './utils/response';

export const app = express();

app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(express.json());

app.get('/', (_req, res) => {
  sendSuccess(res, StatusCodes.OK, 'DevPulse API is running', {
    service: 'DevPulse API',
  });
});

app.use('/api', apiRoutes);

app.use((req, _res, next) => {
  next(notFoundHandler(req.originalUrl));
});

app.use(errorHandler);
