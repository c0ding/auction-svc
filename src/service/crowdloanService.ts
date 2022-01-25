import { GraphQLClient } from 'graphql-request';
import _, { chain, filter, map, reduce } from 'lodash';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { BigNumber } from 'bignumber.js';
import { createQueryBuilder } from 'typeorm';

import {
  Contribution,
  getContributionsByAccountQuery,
  getDotContributionsByAccountQuery,
  getDotContributionsByReferralCodeQuery,
  TDataContribution,
  TDataDotContribution
} from '../graphql/contribution';
import {
  CrowdloanNode,
  CrowdloanStatus,
  getNotDissolvedCrowloansQuery,
  getSubvisStartedCrowloansQuery,
  TDataCrowdloan
} from '../graphql/crowdloan';
import { findReferralByAddress } from '../repo/referralRepo';
import SS58Format from '../model/ss58Format';
import { polkadotGraphQLClient, polkadotParallelGraphQLClient } from '../graphqlClient';
import Relaychain from '../model/relaychain';
import logger from '../logger';
import { Crowdloan as CrowdloanEntity } from '../entity/Crowdloan';
import { DotContribution as DotContributionEntity } from '../entity/DotContribution';

import { getCache, getCacheOrUpdate, setCache } from './redisService';
import { Crowdloan, CrowdloanSummary } from './types';

export const getTotalRaised = (contributions: { amount: string }[]): BigNumber =>
  reduce(
    filter(contributions, 'amount'),
    (sum, contribution) => new BigNumber(contribution.amount).plus(sum),
    new BigNumber(0)
  );

export const getCrowdloansFromSubvis = async (
  client: GraphQLClient,
  relaychain: Relaychain
): Promise<any[]> => {
  const crowdloans = (await getCache(`subvis.${relaychain}.crowdloans`)) as CrowdloanNode[];

  if (crowdloans) {
    return crowdloans;
  }

  const {
    crowdloans: { nodes }
  } = await client.request<TDataCrowdloan>(getNotDissolvedCrowloansQuery);

  const enrichedCrowdloans = nodes.map(({ parachain, contributions, wonAuctionId, ...rest }) => ({
    paraId: parachain.paraId.toString(),
    contributions: contributions.totalCount,
    wonAuctionId: wonAuctionId ? parseInt(wonAuctionId, 10) : null,
    ...rest
  }));

  await setCache(`subvis.${relaychain}.crowdloans`, enrichedCrowdloans);
  return enrichedCrowdloans;
};

export const getSubvisStartedCrowdloanIds = async (
  client: GraphQLClient,
  relaychain: Relaychain
): Promise<number[]> => {
  const cachedStartedCrowdloanIds = (await getCache(
    `subvis.${relaychain}.started_crowdloans.ids`
  )) as number[];

  if (cachedStartedCrowdloanIds) {
    return cachedStartedCrowdloanIds;
  }
  const {
    crowdloans: { nodes }
  } = await client.request<TDataCrowdloan>(getSubvisStartedCrowloansQuery);
  const startedCrowdloanIds: number[] = nodes.map(crowdloan => crowdloan.parachain.paraId);
  await setCache(`subvis.${relaychain}.started_crowdloans.ids`, startedCrowdloanIds, 60);
  return startedCrowdloanIds;
};

export const getStartedCrowdloanIds = async (): Promise<number[]> => {
  try {
    const postgresCrowdloanSummaries = await getNonExpiredCrowdloanSummaries();
    const postgresCrowdloanIds = postgresCrowdloanSummaries
      .filter(summary => summary.status === CrowdloanStatus.STARTED)
      .map(summary => summary.paraId);

    const subvisCrowdloanIds = await getSubvisStartedCrowdloanIds(
      polkadotGraphQLClient,
      Relaychain.POLKADOT
    );

    return [...postgresCrowdloanIds, ...subvisCrowdloanIds];
  } catch (e) {
    logger.error(`Error when try to get the crowdloan ids: ${JSON.stringify(e)}`);
    return Promise.reject(new Error('Failed to get the crowdloan Ids'));
  }
};

export const getContributionsFromSubvis = async (
  client: GraphQLClient,
  account: string,
  relaychain: Relaychain
): Promise<Contribution[]> => {
  const contributions = await getCache(`subvis.${relaychain}.contributions.${account}`);
  if (contributions) {
    return contributions;
  }
  logger.info('Fetch contributions from Subvis by account', { account });

  const {
    contributions: { nodes }
  } = await client.request<TDataContribution>(getContributionsByAccountQuery, {
    account
  });

  const filteredContributions = filter(
    nodes,
    node =>
      node.fund?.status === CrowdloanStatus.WON || node.fund?.status === CrowdloanStatus.STARTED
  );
  await setCache(`subvis.${relaychain}.contributions.${account}`, filteredContributions);
  return filteredContributions;
};

export const getParallelContributionsOfAddress = async (account: string) => {
  const {
    dotContributions: { nodes }
  } = await polkadotParallelGraphQLClient.request<TDataDotContribution>(
    getDotContributionsByAccountQuery,
    {
      account
    }
  );
  return nodes;
};

export const getParallelContributionsOfReferralCode = async (account: string) => {
  const referral = await findReferralByAddress(account);
  if (referral) {
    const {
      dotContributions: { nodes }
    } = await polkadotParallelGraphQLClient.request<TDataDotContribution>(
      getDotContributionsByReferralCodeQuery,
      {
        referralCode: referral.referralCode
      }
    );
    return nodes;
  } else {
    return [];
  }
};

const getDotContributions = async (): Promise<Crowdloan[]> => {
  const updateFunction = async () => {
    const rawdata = await createQueryBuilder(CrowdloanEntity, 'cl')
      .select([
        'cl.id',
        'cl.para_id',
        'cl.parallel_status',
        'dc.amount',
        'dc.account',
        'dc.timestamp'
      ])
      .leftJoin(
        DotContributionEntity,
        'dc',
        'dc.para_id = cl.para_id and dc.block_height >= cl.start_contribute_block and CASE WHEN cl.end_contribute_block is NOT NULL THEN dc.block_height <= cl.end_contribute_block ELSE true END'
      )
      .getRawMany();

    return map(rawdata, item => ({
      id: item.cl_id,
      amount: item.dc_amount,
      account: item.dc_account,
      paraId: item.para_id.toString(),
      status: item.parallel_status,
      timestamp: item.dc_timestamp
    }));
  };
  const cacheKey = 'postgres.polkadot.DotContributions';
  return getCacheOrUpdate(cacheKey, updateFunction, {});
};

export const getNonExpiredDotContributions = async (): Promise<Crowdloan[]> => {
  const dotContributions = await getDotContributions();
  return filter(dotContributions, item => item.status !== CrowdloanStatus.EXPIRED);
};

export const getCrowdloanSummaries = async (): Promise<CrowdloanSummary[]> => {
  const postgresCrowdloans = await getDotContributions();
  return chain(postgresCrowdloans)
    .groupBy('id')
    .map((contributionsOfParaId, key) => ({
      id: key,
      paraId: contributionsOfParaId[0].paraId,
      parallelContributions: filter(contributionsOfParaId, 'amount').length,
      parallelRaised: getTotalRaised(filter(contributionsOfParaId, 'amount')).toString(),
      status: contributionsOfParaId[0].status
    }))
    .value();
};

export const getNonExpiredCrowdloanSummaries = async (): Promise<CrowdloanSummary[]> => {
  const postgresCrowdloans = await getCrowdloanSummaries();
  return filter(postgresCrowdloans, item => item.status !== CrowdloanStatus.EXPIRED);
};

export const getMarketShare = async (client: GraphQLClient, account: string) => {
  const decodedAccount = decodeAddress(account);
  const marketShare = await getContributionsFromSubvis(
    client,
    encodeAddress(decodeAddress(decodedAccount), SS58Format.POLKADOT_SS58_FORMAT),
    Relaychain.POLKADOT
  );
  const filteredContributions = chain(marketShare)
    .groupBy('fundId')
    .reduce((acc, value, key) => {
      return {
        ...acc,
        [key]: _.sumBy(value, item => parseInt(item.amount))
      };
    }, {});
  return {
    length: marketShare.length,
    data: filteredContributions
  };
};
