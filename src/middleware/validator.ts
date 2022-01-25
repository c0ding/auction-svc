import { validateAddress } from '@polkadot/util-crypto';
import { NextFunction, Request, Response } from 'express';

import { CustomBadRequestError, CustomErrorCode } from '../errors/error';

export const validateAccountParam = async (req: Request, _: Response, next: NextFunction) => {
  const address = req.params.account;
  try {
    validateAddress(address);
    next();
  } catch {
    next(new CustomBadRequestError(CustomErrorCode.AddressInValid, { address }));
  }
};
