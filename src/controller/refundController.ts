import { NextFunction, Request, Response } from 'express';
import { JsonDecoder } from 'ts.data.json';
import { isNumber } from 'lodash';

import logger from '../logger';
import { RefundActionType, RefundRequestBodyType } from '../service/types';
import { isValidReferralCode } from '../service/referralService';
import {
  getRefundActionsByExample,
  getRefundActionsByIds,
  getRefundInfo,
  isValidAmountForAction,
  saveRefundActionIfHaveEnoughRefund
} from '../service/refundService';
import { validateSignature } from '../utils/cryptoUtils';
import { CustomBadRequestError, CustomErrorCode, CustomInternalServerError } from '../errors/error';
import { getStartedCrowdloanIds } from '../service/crowdloanService';

const handleGetRefund = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Refund information GET request ', { account: req.params.account });
  getRefundInfo(req.params.account)
    .then(refund => res.status(200).json(refund))
    .catch(err => {
      next(new CustomInternalServerError(CustomErrorCode.GetRefundInformationFailed, err));
    });
};

const validateRequestBodyJson = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Refund action POST request.', {
    account: req.params.account,
    body: req.body
  });
  const requestDecoder = JsonDecoder.object<RefundRequestBodyType>(
    {
      signature: JsonDecoder.string,
      payload: JsonDecoder.object(
        {
          amount: JsonDecoder.string,
          paraId: JsonDecoder.optional(JsonDecoder.number),
          referralCode: JsonDecoder.optional(JsonDecoder.string),
          action: JsonDecoder.enumeration(RefundActionType, 'RefundActionType'),
          timestamp: JsonDecoder.string
        },
        'RefundRequestPayload'
      )
    },
    'RefundRequestDecoder'
  );

  requestDecoder
    .decodeToPromise(req.body)
    .then(() => {
      logger.info('Request body is valid.');
      next();
    })
    .catch(err => {
      next(
        new CustomBadRequestError(CustomErrorCode.RefundRequestTypeDecoderFailed, {
          decodeError: err
        })
      );
    });
};

const validateActionAndAmount = async (req: Request, res: Response, next: NextFunction) => {
  const { action, amount } = req.body.payload;

  if (isValidAmountForAction(action, amount)) {
    logger.info('Amount in request body is valid.');
    next();
  } else {
    next(new CustomBadRequestError(CustomErrorCode.RefundRequestAmountInvalid));
  }
};

const validateRefundSignature = async (req: Request, res: Response, next: NextFunction) => {
  const { signature, payload } = req.body;
  const address = req.params.account;
  try {
    const isValid = await validateSignature(JSON.stringify(payload), signature, address);

    if (isValid) {
      logger.info('Refund action Signature validation successfully.');
      next();
    } else {
      next(new CustomBadRequestError(CustomErrorCode.RefundRequestSignatureInvalid));
    }
  } catch (err) {
    next(new CustomInternalServerError(CustomErrorCode.ValidateSignatureFailed, err));
  }
};

const validateTimestampExpiration = (req: Request, res: Response, next: NextFunction) => {
  const t = new Date(req.body.payload.timestamp);
  const diff = Date.now() - t.getTime();
  const limitInMilliSeconds = 5 * 60 * 1000; // 5min in milli seconds
  if (diff <= limitInMilliSeconds) {
    next();
  } else {
    next(new CustomBadRequestError(CustomErrorCode.RefundRequestExpired));
  }
};

const hasEnoughRefund = async (req: Request, res: Response, next: NextFunction) => {
  const address = req.params.account;
  try {
    const refundInfo = await getRefundInfo(address);
    if (refundInfo.refundAvailable >= parseInt(req.body.payload?.amount, 10)) {
      logger.info('The refund balance of the account is enough', { account: address });
      next();
    } else {
      next(new CustomBadRequestError(CustomErrorCode.NoEnoughRefundBalance));
    }
  } catch (err) {
    next(new CustomInternalServerError(CustomErrorCode.CheckAvailableRefundBalanceFailed, err));
  }
};

const handleSaveRefund = async (req: Request, res: Response, next: NextFunction) =>
  saveRefundActionIfHaveEnoughRefund({
    account: req.params.account,
    ...req.body.payload,
    signature: req.body.signature,
    signedMessage: JSON.stringify(req.body.payload)
  })
    .then(data => {
      logger.info('Save refund action successfully.');
      res.status(200).json(data);
    })
    .catch(err => {
      next(new CustomInternalServerError(CustomErrorCode.SaveRefundActionFailed, err));
    });

const validateReferralCodeIfExist = async (req: Request, res: Response, next: NextFunction) => {
  const { referralCode } = req.body.payload;
  if (referralCode) {
    const isValid = await isValidReferralCode(referralCode);
    if (isValid) {
      logger.info('Referral code validation successfully.');
      next();
    } else {
      next(new CustomBadRequestError(CustomErrorCode.RefundRequestReferralCodeInvalid));
    }
  } else {
    next();
  }
};

const isNewAction = async (req: Request, res: Response, next: NextFunction) => {
  const { action, amount, paraId, referralCode, timestamp } = req.body.payload;
  const account = req.params.account;
  try {
    const refundInfo = await getRefundActionsByExample(
      account,
      action,
      amount,
      paraId,
      timestamp,
      referralCode
    );
    if (refundInfo.length === 0) {
      logger.info('This is a new refund action.');
      next();
    } else if (refundInfo.length === 1) {
      next(
        new CustomBadRequestError(CustomErrorCode.SameRefundActionAlreadyExists, {
          recordId: refundInfo[0].id
        })
      );
    } else {
      next(
        new CustomInternalServerError(CustomErrorCode.DuplicatedRefundActions, {
          recordId: JSON.stringify(refundInfo.map(r => r.id))
        })
      );
    }
  } catch (err) {
    next(new CustomInternalServerError(CustomErrorCode.CheckRefundActionExistsFailed, err));
  }
};

const handleGetActionsByIds = async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  logger.info('Refund actions GET request', { ids });
  if (ids) {
    const actions = await getRefundActionsByIds(ids);
    res.status(200).json(actions);
  } else {
    next(new CustomBadRequestError(CustomErrorCode.NoIdsInGetRefundActions));
  }
};

const isValidParaIds = async (paraId: number): Promise<boolean> => {
  const auctionStartedParaIds = await getStartedCrowdloanIds();
  return auctionStartedParaIds.includes(paraId);
};

const validateParaIds = async (req: Request, res: Response, next: NextFunction) => {
  const { paraId } = req.body.payload;
  if (isNumber(paraId)) {
    const validParaId = await isValidParaIds(paraId);
    if (validParaId) {
      logger.info('Para id validation successfully.');
      next();
    } else {
      next(new CustomBadRequestError(CustomErrorCode.RefundRequestParaIdInvalid, { paraId }));
    }
  } else {
    next();
  }
};

export {
  handleGetRefund,
  validateRequestBodyJson,
  validateTimestampExpiration,
  validateActionAndAmount,
  validateRefundSignature,
  validateReferralCodeIfExist,
  validateParaIds,
  hasEnoughRefund,
  handleSaveRefund,
  isNewAction,
  handleGetActionsByIds
};
