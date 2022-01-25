import { CrowdloanCollection, CrowdloanModel } from '../model/crowdloan';
import { ReferralCode } from '../model/referral';

export const findCrowdloansByReferralCode = async (
  referralCode: ReferralCode
): Promise<CrowdloanCollection[]> =>
  await CrowdloanModel.find({ referralCode, paraId: 2085 }).exec();

export const findCrowdloansByAddress = async (account: string): Promise<CrowdloanCollection[]> =>
  await CrowdloanModel.find({ account, paraId: 2085 }).where('referralCode').nin([null, '']).exec();

export const findCrowdloansByParaIds = async (paraIds: number[]): Promise<CrowdloanCollection[]> =>
  await CrowdloanModel.find().where('paraId').in(paraIds).exec();
