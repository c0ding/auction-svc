import { NextFunction, Request, Response } from 'express';

import { CustomError } from './error';

const errorHandler = (
  error: Error | CustomError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(500);
};

export default errorHandler;
