import { model, Schema } from 'mongoose';

import { ReferralCode } from './referral';

export type CrowdloanCollection = {
  blockHeight: number;
  amount: number;
  account: string;
  referralCode: ReferralCode | null;
  paraId: number;
  extrinsichash: string;
  timestamp: string;
};

const CrowdloanSchema = new Schema<CrowdloanCollection>({
  blockHeight: String,
  amount: Number,
  account: String,
  referralCode: String,
  paraId: Number,
  extrinsichash: Number,
  timestamp: String
});

export const CrowdloanModel = model<CrowdloanCollection>('Crowdloan', CrowdloanSchema, 'crowdloan');
