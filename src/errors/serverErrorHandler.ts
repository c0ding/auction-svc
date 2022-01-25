import { NextFunction, Request, Response } from 'express';

import logger from '../logger';

import { CustomError, CustomInternalServerError } from './error';

const serverErrorHandler = (
  error: Error | CustomError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomInternalServerError) {
    logger.error(error.message, { err: error.err });
    res.status(500).json({ code: error.code, error: 'Something wrong inside service.' });
  }
  next(error);
};

export default serverErrorHandler;
