import { NextFunction, Request, Response } from 'express';

import logger from '../logger';

import { CustomBadRequestError, CustomError } from './error';

const clientErrorHandler = (
  error: Error | CustomError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomBadRequestError) {
    logger.info(error.message, { ...error.payload });
    res.status(400).json({ code: error.code, error: error.message });
  }
  next(error);
};

export default clientErrorHandler;
