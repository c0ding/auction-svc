import { generateReferralCode } from '../service/referralService';
import { ReferralCollection, ReferralModel } from '../model/referral';

export const findReferralOrCreate = async (address: string): Promise<ReferralCollection> =>
  ReferralModel.findOneAndUpdate(
    { address },
    {
      $setOnInsert: {
        address: address,
        referralCode: generateReferralCode(address)
      }
    },
    {
      returnOriginal: false,
      upsert: true
    }
  );

export const findReferralByReferralCode = async (
  referralCode: string
): Promise<ReferralCollection | null> => await ReferralModel.findOne({ referralCode }).exec();

export const findReferralByAddress = async (address: string): Promise<ReferralCollection | null> =>
  await ReferralModel.findOne({ address }).exec();
