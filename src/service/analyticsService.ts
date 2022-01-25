import { chain, filter, map, orderBy } from 'lodash';
import { GraphQLClient } from 'graphql-request';

import { getPolkadotAccount } from '../utils/cryptoUtils';
import Relaychain from '../model/relaychain';
import { getContributionsByAccountsQuery, TDataContribution } from '../graphql/contribution';
import { CrowdloanStatus } from '../graphql/crowdloan';

import { getCacheOrUpdate } from './redisService';
import { getTotalRaised } from './crowdloanService';

const getContributionsForAccountsFromSubvis = async (
  client: GraphQLClient,
  accounts: string[],
  relaychain: Relaychain
) => {
  const updateFunction = async () => {
    const {
      contributions: { nodes }
    } = await client.request<TDataContribution>(getContributionsByAccountsQuery, {
      accounts
    });

    return filter(
      nodes,
      node =>
        node.fund?.status === CrowdloanStatus.WON || node.fund?.status === CrowdloanStatus.STARTED
    );
  };

  const cacheKey = `subvis.${relaychain}.contributions.${orderBy(accounts).join(',')}`;
  return getCacheOrUpdate(cacheKey, updateFunction, {});
};

export const getMarketShareDataForAccounts = async (client: GraphQLClient, accounts: string[]) => {
  const polkadotAccounts = map(accounts, getPolkadotAccount);
  const marketShare = await getContributionsForAccountsFromSubvis(
    client,
    polkadotAccounts,
    Relaychain.POLKADOT
  );

  return chain(marketShare)
    .groupBy('account')
    .map((data, account) => {
      const totalRaisedByFund = chain(data)
        .groupBy('fundId')
        .map((data, key) => ({ [key]: getTotalRaised(data).toNumber() }))
        .value();
      return {
        id: account,
        totalValue: getTotalRaised(data).toNumber(),
        data: totalRaisedByFund
      };
    })
    .orderBy('totalValue', 'desc')
    .value();
};
