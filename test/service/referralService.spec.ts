import { BigNumber } from 'bignumber.js';

import {
  generateReferralCode,
  getBonusByReferralCode,
  getBonusByAddress
} from '../../src/service/referralService';

jest.mock('../../src/repo/crowdloanRepo', () => ({
  findCrowdloansByReferralCode: () => [
    { account: 'contributor-address', referralCode: 'referrer-code', amount: 1000 },
    { account: 'contributor-address', referralCode: 'referrer-code', amount: 3000 }
  ],
  findCrowdloansByAddress: () => [
    { account: 'contributor-address', referralCode: 'referrer-code', amount: 1000 },
    { account: 'contributor-address', referralCode: 'referrer-code', amount: 3000 }
  ]
}));

describe('referralService', () => {
  describe('generateReferralCode', () => {
    it('should return 32 bit hash value', () => {
      const hashValue = generateReferralCode('52081454-7eef-4f4a-8b5b-8d0d7887a9fd');

      expect(hashValue).toHaveLength(66);
      expect(hashValue.startsWith('0x')).toBeTruthy();
    });
  });

  describe('getBonusByReferralCode', () => {
    it('should return referrer bonus', async () => {
      const bonus: BigNumber = await getBonusByReferralCode('referrer-code');

      expect(bonus.toString()).toEqual('200');
    });
  });

  describe('getBonusByAddress', () => {
    it('should return contributor bonus', async () => {
      const bonus: BigNumber = await getBonusByAddress('contributor-address');

      expect(bonus.toString()).toEqual('200');
    });
  });
});
