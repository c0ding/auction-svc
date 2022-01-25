import express from 'express';

import logger from '../logger';
import {
  getMoonbeamRewardAddressOfAddress,
  getMoonbeamTermsSignedOfAddress
} from '../service/moonbeamService';

const router = express.Router();

router.get('/rewards-address/:account', async (req, res) => {
  try {
    const data = await getMoonbeamRewardAddressOfAddress(req.params.account);
    res.status(200).json({
      rewardAddress: data.length === 0 ? null : data[0].rewardAddress
    });
  } catch (error) {
    logger.error(`Failed to get rewards address for account: ${req.params.account}`, error);
    res.status(500);
  }
});

router.get('/terms-signed/:account', async (req, res) => {
  try {
    const data = await getMoonbeamTermsSignedOfAddress(req.params.account);
    res.status(200).json({
      isTermsSigned: data.length !== 0
    });
  } catch (error) {
    logger.error(`Failed to get terms signed data for account: ${req.params.account}`, error);
    res.status(500);
  }
});

export default router;
