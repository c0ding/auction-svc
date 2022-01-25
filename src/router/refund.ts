import express from 'express';

import {
  handleGetRefund,
  handleSaveRefund,
  isNewAction,
  hasEnoughRefund,
  validateActionAndAmount,
  validateRefundSignature,
  validateReferralCodeIfExist,
  handleGetActionsByIds,
  validateRequestBodyJson,
  validateTimestampExpiration,
  validateParaIds
} from '../controller/refundController';

const router = express.Router();

router.get('/:account', handleGetRefund);
router.post(
  '/:account/action',
  validateRequestBodyJson,
  validateParaIds,
  validateTimestampExpiration,
  validateRefundSignature,
  validateActionAndAmount,
  validateReferralCodeIfExist,
  isNewAction,
  hasEnoughRefund,
  handleSaveRefund
);
router.post('/actions', handleGetActionsByIds);

export default router;
