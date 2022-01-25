import { blake2AsHex } from '@polkadot/util-crypto';
import { reduce } from 'lodash';
import { BigNumber } from 'bignumber.js';

import { ReferralCode, ReferralCollection } from '../model/referral';
import { CrowdloanCollection } from '../model/crowdloan';
import { findCrowdloansByAddress, findCrowdloansByReferralCode } from '../repo/crowdloanRepo';
import { findReferralByReferralCode } from '../repo/referralRepo';

export const generateReferralCode = (address: string): ReferralCode =>
  blake2AsHex(JSON.stringify({ from: 'hekio', address }), 256);

export const getBonusByReferralCode = async (referralCode: ReferralCode): Promise<BigNumber> => {
  const crowdloans: CrowdloanCollection[] = await findCrowdloansByReferralCode(referralCode);
  return getReferralAmount(crowdloans);
};

export const getBonusByAddress = async (address: string): Promise<BigNumber> => {
  const crowdloans: CrowdloanCollection[] = await findCrowdloansByAddress(address);
  return getReferralAmount(crowdloans);
};

export const getReferralByReferralCode = async (
  referralCode: ReferralCode
): Promise<ReferralCollection | null> => findReferralByReferralCode(referralCode);

export const isValidReferralCode = async (referralCode: ReferralCode): Promise<boolean> =>
  findReferralByReferralCode(referralCode)
    .then(referral => referral !== null)
    .catch(() => false);

export const getReferralAmount = (contributions: { amount: number }[]) =>
  reduce(
    contributions,
    (sum, contribution) => new BigNumber(contribution.amount).multipliedBy(0.05).plus(sum),
    new BigNumber(0)
  );
