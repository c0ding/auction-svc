import { AsyncLocalStorage } from 'async_hooks';

import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';

interface Storage {
  transactionId: string;
}

const localStorage = new AsyncLocalStorage<Storage>();

const localStorageMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  localStorage.run(
    {
      transactionId: v4()
    },
    () => {
      next();
    }
  );
};

export const getTransactionId = () => localStorage.getStore()?.transactionId;

export default localStorageMiddleware;
