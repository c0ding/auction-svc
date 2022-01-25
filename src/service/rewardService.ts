import {
  filter,
  get,
  groupBy,
  intersection,
  isEmpty,
  map,
  find,
  chain,
  orderBy,
  concat,
  uniq
} from 'lodash';
import { In, createQueryBuilder } from 'typeorm';
import { GraphQLClient } from 'graphql-request';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';

import { CrowdloanCollection } from '../model/crowdloan';
import { Contribution, DotContribution } from '../graphql/contribution';
import SS58Format from '../model/ss58Format';
import Relaychain, { RAW_DECIMALS } from '../model/relaychain';
import { findCrowdloansByAddress, findCrowdloansByReferralCode } from '../repo/crowdloanRepo';
import { findReferralByAddress } from '../repo/referralRepo';
import { RewardDistributionWhitelist } from '../entity/RewardDistributionWhitelist';
import { RewardDistributionAddressMapping } from '../entity/RewardDistributionAddressMapping';
import { MoonbeamTermsSigned } from '../entity/MoonbeamTermsSigned';
import MOONBEAM_SIGNED_ADDRESSES from '../model/moonbeamSignedAddresses';
import { UserProjectRewardInfo } from '../entity/UserProjectRewardInfo';
import { Crowdloan as CrowdloanEntity } from '../entity/Crowdloan';
import { CrowdloanStatus } from '../graphql/crowdloan';
import { getPolkadotAccount } from '../utils/cryptoUtils';
import unitToBalance from '../utils/calculation';

import { getReferralAmount } from './referralService';
import {
  getContributionsFromSubvis,
  getNonExpiredDotContributions,
  getParallelContributionsOfAddress,
  getParallelContributionsOfReferralCode,
  getTotalRaised
} from './crowdloanService';
import { MULTISIG_ADDR } from './constants';

const calculateReferralAmountForKusama = (
  contributions: Contribution[],
  parallelContributionsOfAddress: any[],
  parallelContributionsOfReferralCode: any[]
): string => {
  const paraId = get(contributions, '0.parachain.paraId');
  const startBlockNumber = get(contributions, '0.fund.blockNum');
  const endBlockNumber = get(contributions, '0.fund.lockExpiredBlock');

  const predicateByParaIdAndBlockNumberRange = (crowdloan: CrowdloanCollection | DotContribution) =>
    crowdloan.paraId === paraId &&
    crowdloan.blockHeight >= startBlockNumber &&
    crowdloan.blockHeight <= endBlockNumber;

  const contributorContributions = filter(
    parallelContributionsOfAddress,
    predicateByParaIdAndBlockNumberRange
  );
  const referrerContributions = filter(
    parallelContributionsOfReferralCode,
    predicateByParaIdAndBlockNumberRange
  );

  return getReferralAmount(contributorContributions)
    .plus(getReferralAmount(referrerContributions))
    .toString();
};
export const mapToRewardsForKusama = (
  contributions: Contribution[],
  parallelContributionsOfAddress: any[],
  parallelContributionsOfReferralCode: any[]
) => {
  return map(groupBy(contributions, 'fundId'), (contributionsOfFundId, key) => {
    const fundStatus = get(contributionsOfFundId, '0.fund.status');
    const paraId = get(contributionsOfFundId, '0.parachain.paraId');
    const referralAmount = calculateReferralAmountForKusama(
      contributionsOfFundId,
      parallelContributionsOfAddress,
      parallelContributionsOfReferralCode
    );

    return {
      fundId: key,
      fundStatus: fundStatus,
      paraId: paraId.toString(),
      amount: getTotalRaised(contributionsOfFundId).toString(),
      referralAmount
    };
  });
};
export const getRewardsForKusama = async (client: GraphQLClient, account: string) => {
  const decodedAccount = decodeAddress(account);
  const kusamaAccount = encodeAddress(decodedAccount, SS58Format.KUSAMA_SS58_FORMAT);
  const subvisContributions = await getContributionsFromSubvis(
    client,
    kusamaAccount,
    Relaychain.KUSAMA
  );

  const parallelContributionsOfAddress = await findCrowdloansByAddress(kusamaAccount);
  const referral = await findReferralByAddress(account);
  const parallelContributionsOfReferralCode = referral
    ? await findCrowdloansByReferralCode(referral.referralCode)
    : [];

  return mapToRewardsForKusama(
    subvisContributions,
    parallelContributionsOfAddress,
    parallelContributionsOfReferralCode
  );
};
const calculateReferralAmountForPolkadot = (
  contributions: Contribution[],
  parallelContributionsOfAddress: any[],
  parallelContributionsOfReferralCode: any[]
): string => {
  const paraId = get(contributions, '0.parachain.paraId');
  const startBlockNumber = get(contributions, '0.fund.blockNum');
  const endBlockNumber = get(contributions, '0.fund.lockExpiredBlock');

  const predicateByParaIdAndBlockNumberRange = (crowdloan: DotContribution) =>
    crowdloan.paraId === paraId &&
    crowdloan.executedBlockHeight >= startBlockNumber &&
    crowdloan.executedBlockHeight <= endBlockNumber;

  const contributorContributions = filter(
    parallelContributionsOfAddress,
    predicateByParaIdAndBlockNumberRange
  );
  const referrerContributions = filter(
    parallelContributionsOfReferralCode,
    predicateByParaIdAndBlockNumberRange
  );

  return getReferralAmount(contributorContributions)
    .plus(getReferralAmount(referrerContributions))
    .toString();
};
const mapToRewardsForPolkadot = (
  contributions: Contribution[],
  parallelContributionsOfAddress: any[],
  parallelContributionsOfReferralCode: any[]
) => {
  return map(groupBy(contributions, 'fundId'), (contributionsOfFundId, key) => {
    const fundStatus = get(contributionsOfFundId, '0.fund.status');
    const paraId = get(contributionsOfFundId, '0.parachain.paraId');
    const referralAmount = calculateReferralAmountForPolkadot(
      contributionsOfFundId,
      parallelContributionsOfAddress,
      parallelContributionsOfReferralCode
    );
    return {
      fundId: key,
      fundStatus: fundStatus,
      paraId: paraId.toString(),
      amount: getTotalRaised(contributionsOfFundId).toString(),
      referralAmount
    };
  });
};
export const getRewardsForPolkadot = async (client: GraphQLClient, account: string) => {
  const polkadotAccount = getPolkadotAccount(account);

  const parallelContributionsOfAddress = await getParallelContributionsOfAddress(polkadotAccount);
  const parallelContributionsOfReferralCode = await getParallelContributionsOfReferralCode(account);

  const multisigPolkadotAccount = getPolkadotAccount(MULTISIG_ADDR);
  const contributionsOfMultisig = await getContributionsFromSubvis(
    client,
    multisigPolkadotAccount,
    Relaychain.POLKADOT
  );

  const intersectionBlockNumbers = intersection(
    map(contributionsOfMultisig, 'blockNum'),
    map(parallelContributionsOfAddress, 'executedBlockHeight')
  );

  const filteredSubvisContributions = filter(contributionsOfMultisig, item =>
    intersectionBlockNumbers.includes(item.blockNum)
  );
  const filteredParallelContributionsOfAddress = filter(parallelContributionsOfAddress, item =>
    intersectionBlockNumbers.includes(item.executedBlockHeight)
  );

  const subvisContributions = await getContributionsFromSubvis(
    client,
    polkadotAccount,
    Relaychain.POLKADOT
  );
  const allContributions = [...subvisContributions, ...filteredSubvisContributions];

  return mapToRewardsForPolkadot(
    allContributions,
    filter(filteredParallelContributionsOfAddress, item => isEmpty(item.referralCode)),
    parallelContributionsOfReferralCode
  );
};
export const getRewardsForPolkadotFromParallel = async (account: string) => {
  const polkadotAccount = getPolkadotAccount(account);
  const dotContributions = await getNonExpiredDotContributions();
  const dotContributionsOfAddress = filter(dotContributions, { account: polkadotAccount });
  return map(groupBy(dotContributionsOfAddress, 'paraId'), (value, paraId) => ({
    paraId: paraId.toString(),
    amount: getTotalRaised(value).toString()
  }));
};

export const checkIfInRewardDistributionWhitelist = async (account: string) => {
  const result = await RewardDistributionWhitelist.find({
    where: { originAddress: account }
  });
  return !isEmpty(result);
};

export const insertToRewardDistributionWhitelist = async (account: string) => {
  const entity = new RewardDistributionWhitelist();
  entity.originAddress = account;
  return await RewardDistributionWhitelist.save(entity);
};

export const getRewardDistributionAddressMappings = async (addresses: string[]) => {
  const result = await RewardDistributionAddressMapping.find({ originAddress: In(addresses) });
  return chain(result)
    .groupBy('originAddress')
    .map((value, key) => {
      return {
        oriAddress: key,
        dstAddress: get(orderBy(value, 'createAt', 'desc'), '0.destinationAddress')
      };
    })
    .value();
};

export const getMoonbeamSignedAddresses = async () => {
  const result = await MoonbeamTermsSigned.find({ select: ['account'] });
  return uniq(concat(MOONBEAM_SIGNED_ADDRESSES, map(result, 'account')));
};

const getRewardInfoForWonProjectByAccount = async (account: string) => {
  const data = await createQueryBuilder(UserProjectRewardInfo, 'upri')
    .select(['upri.*', 'cl.*'])
    .innerJoin(CrowdloanEntity, 'cl', 'upri.para_id = cl.para_id')
    .where('upri.ori_address = :account', { account })
    .andWhere('cl.parallel_status = :status', { status: CrowdloanStatus.WON })
    .getRawMany();

  return map(data, item => ({
    paraId: item.para_id.toString(),
    status: item.parallel_status,
    dotAmount: unitToBalance(item.dot_amount, RAW_DECIMALS.DOT),
    projectRewards: {
      total: unitToBalance(item.project_total_rewards, item.project_decimal),
      base: unitToBalance(item.project_base_bonus, item.project_decimal),
      earlyBird: unitToBalance(item.project_early_bird_bonus, item.project_decimal),
      referral: unitToBalance(item.project_referral_bonus, item.project_decimal),
      other: unitToBalance(item.project_other_bonus, item.project_decimal),
      received: null
    },
    paraRewards: {
      total: unitToBalance(item.para_total_rewards, RAW_DECIMALS.PARA),
      base: unitToBalance(item.para_base_bonus, RAW_DECIMALS.PARA),
      referral: unitToBalance(item.para_referral_bonus, RAW_DECIMALS.PARA),
      reinvest: unitToBalance(item.para_reinvest_bonus, RAW_DECIMALS.PARA),
      other: unitToBalance(item.para_other_bonus, RAW_DECIMALS.PARA)
    }
  }));
};

export const getRewardInfoByAccount = async (account: string) => {
  const polkadotAccount = getPolkadotAccount(account);

  // Won projects reward info
  const wonProjectsRewardInfo = await getRewardInfoForWonProjectByAccount(polkadotAccount);

  // Non-expired projects reward info
  const dotContributions = await getNonExpiredDotContributions();
  const dotContributionsOfAddress = filter(dotContributions, { account: polkadotAccount });
  const nonExpiredProjectsRewardInfo = map(groupBy(dotContributionsOfAddress, 'id'), value => ({
    paraId: value[0].paraId.toString(),
    status: value[0].status,
    dotAmount: unitToBalance(getTotalRaised(value).toNumber(), RAW_DECIMALS.DOT)
  }));

  // Merge reward info
  return map(nonExpiredProjectsRewardInfo, item => {
    const matchedRewardInfo = find(
      wonProjectsRewardInfo,
      rewardInfo => item.status === CrowdloanStatus.WON && rewardInfo.paraId === item.paraId
    );
    return matchedRewardInfo || item;
  });
};
