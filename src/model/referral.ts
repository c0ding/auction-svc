import { Schema, model } from 'mongoose';

export type ReferralCode = string;

export type ReferralCollection = {
  address: string;
  referralCode: ReferralCode;
};

const referralSchema = new Schema<ReferralCollection>({
  address: String,
  referralCode: String
});

export const ReferralModel = model<ReferralCollection>('Referral', referralSchema, 'referrals');
