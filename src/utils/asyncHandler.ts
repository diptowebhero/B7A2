import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

type AsyncController<P extends ParamsDictionary = ParamsDictionary> = (
  req: Request<P>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = <P extends ParamsDictionary = ParamsDictionary>(controller: AsyncController<P>) => {
  return (req: Request<P>, res: Response, next: NextFunction): void => {
    void controller(req, res, next).catch(next);
  };
};
