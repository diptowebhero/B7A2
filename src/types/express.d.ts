import { JwtPayloadData } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadData;
    }
  }
}
