import express from 'express';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';

import { ReferralCollection } from '../model/referral';
import {
  findReferralByAddress,
  findReferralByReferralCode,
  findReferralOrCreate
} from '../repo/referralRepo';
import { getBonusByAddress, getBonusByReferralCode } from '../service/referralService';
import SS58Format from '../model/ss58Format';

const router = express.Router();
const isValidAddress = (address: string): boolean => Boolean(address);

router.post('/', async (req, res) => {
  const address: string = req.body.address;

  if (!isValidAddress(address)) {
    return res.status(400).json({
      error: 'Invalid address!'
    });
  }
  try {
    const referral: ReferralCollection = await findReferralOrCreate(address);
    res.status(200).json({
      referralCode: referral.referralCode
    });
  } catch (error: unknown) {
    console.error(
      `Error when getting referral code, address: ${address}.`,
      `error: ${JSON.stringify(error)}`
    );
    res.status(500).json({
      error: 'Something wrong when getting referral code!'
    });
  }
});

router.get('/:referralCode/check', async (req, res) => {
  const code: string = req.params.referralCode;
  const referral = await findReferralByReferralCode(code);
  if (referral) {
    res.status(200).json({
      address: referral.address,
      referralCode: referral.referralCode
    });
  } else {
    res.status(404).json({ error: `No referral code exists. Referral code: ${code}` });
  }
});

router.get('/:address/heiko-bonus', async (req, res) => {
  const decodedAccount = decodeAddress(req.params.address);
  const kusamaAccount = encodeAddress(decodedAccount, SS58Format.KUSAMA_SS58_FORMAT);
  const bonusAsContributor = await getBonusByAddress(kusamaAccount);

  const referral = await findReferralByAddress(req.params.address);
  const bonusAsReferer = referral ? await getBonusByReferralCode(referral.referralCode) : 0;

  res.status(200).json({
    bonus: bonusAsContributor.plus(bonusAsReferer).toString()
  });
});

export default router;
