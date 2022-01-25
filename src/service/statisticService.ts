import { BigNumber } from 'bignumber.js';
import {
  concat,
  filter,
  forEach,
  groupBy,
  head,
  keys,
  map,
  orderBy,
  uniq,
  uniqBy,
  intersection,
  get
} from 'lodash';
import moment from 'moment-timezone';
import { GraphQLClient } from 'graphql-request';

import {
  Contribution,
  getContributionsBeforeTodayByFundIdsQuery,
  getTodayContributionsByFundIdsQuery,
  TDataContribution
} from '../graphql/contribution';
import Relaychain, { CHAIN_CONFIG, RAW_DECIMALS } from '../model/relaychain';

import { getCache, setCache } from './redisService';
import { getDotPrice, getKsmPrice } from './pricesService';
import { getTotalRaised } from './crowdloanService';

const getRawCurrencyDecimal = (currency: string) => get(RAW_DECIMALS, currency, NaN);

const unitToBalance = (amount: number | string, decimalType: string): Number => {
  const base = new BigNumber(10).pow(getRawCurrencyDecimal(decimalType));
  return new BigNumber(amount).dividedBy(base).toNumber();
};

export interface CrowdloanStatistics {
  total: {
    raised: number;
    value?: number;
    contributors?: number;
    contributorAccounts?: string[];
  };
  stats: {
    [key: string]: string | number;
  }[];
}

moment.tz.setDefault('America/Los_Angeles');

const parseContributionsWithDate = (contributions: Contribution[]): Contribution[] => {
  return map(contributions, contribution => ({
    ...contribution,
    createdAt: moment(contribution.createdAt).utc().format('MMM DD, YYYY')
  }));
};

export const getContributionStatistics = (
  contributions: Contribution[],
  fundIds: string[],
  relaychain: Relaychain
) => {
  const contributionsWithDate: Contribution[] = parseContributionsWithDate(contributions);
  const dates = keys(groupBy(contributionsWithDate, 'createdAt'));

  return map(dates, date => {
    let result = { date };
    fundIds.forEach(fundId => {
      const filteredContributions: Contribution[] = filter(contributionsWithDate, crowdloan => {
        return (
          crowdloan.fundId === fundId &&
          moment(new Date(crowdloan.createdAt)).isSameOrBefore(moment(new Date(date)))
        );
      });
      result = {
        ...result,
        [fundId]: unitToBalance(
          getTotalRaised(filteredContributions).toNumber(),
          CHAIN_CONFIG[relaychain].unit
        )
      };
    });
    return result;
  });
};

const getStatisticsWithCache = async (
  relaychain: Relaychain,
  client: GraphQLClient,
  query: string,
  fundIds: string[],
  today: Date,
  cacheKey: string,
  cacheTime: number,
  forceUpdate: boolean = false
) => {
  const cachedStatisticsData = await getCache(cacheKey);
  if (cachedStatisticsData && !forceUpdate) {
    return cachedStatisticsData;
  }
  const {
    contributions: { nodes }
  } = await client.request<TDataContribution>(query, {
    fundIds,
    today
  });

  const totalRaised = unitToBalance(
    getTotalRaised(nodes).toNumber(),
    CHAIN_CONFIG[relaychain].unit
  );
  const statisticsData = {
    total: {
      raised: totalRaised,
      contributorAccounts: map(uniqBy(nodes, 'account'), 'account')
    },
    stats: getContributionStatistics(nodes, fundIds, relaychain)
  };
  setCache(cacheKey, statisticsData, cacheTime);
  return statisticsData;
};

const orderByTime = (stats: CrowdloanStatistics['stats']) => {
  return orderBy(stats, [item => new Date(item.date)], ['asc']);
};

const getMergedTodayStatistics = (
  todayStatistics: CrowdloanStatistics['stats'],
  statisticsBeforeToday: CrowdloanStatistics['stats']
) => {
  const yesterdayStats = head(orderByTime(statisticsBeforeToday).reverse());
  return todayStatistics.map((stats: { [key: string]: string | number }) => {
    const result: { [key: string]: string | number } = {};
    forEach(stats, (value: string | number, key: string) => {
      if (key !== 'date') {
        result[key] = new BigNumber(value)
          .plus(new BigNumber(yesterdayStats?.[key] ?? 0))
          .toNumber();
      } else {
        result.date = value;
      }
    });
    return result;
  });
};

export const getStatistics = async (
  client: GraphQLClient,
  fundIds: string[],
  relaychain: Relaychain
) => {
  let cachedTime: string = await getCache('last.statistics.cached.time');
  const midnightOfToday = moment().startOf('day').toISOString();
  const forceUpdate = cachedTime !== midnightOfToday;
  if (forceUpdate) {
    setCache('last.statistics.cached.time', midnightOfToday, 24 * 60 * 60);
    cachedTime = midnightOfToday;
  }

  const prefix = `subvis.${relaychain}.contributions.${orderBy(fundIds).join(',')}`;
  const { total: totalBeforeToday, stats: statsBeforeToday } = await getStatisticsWithCache(
    relaychain,
    client,
    getContributionsBeforeTodayByFundIdsQuery,
    fundIds,
    new Date(cachedTime),
    `${prefix}.before.today`,
    24 * 60 * 60,
    forceUpdate
  );
  const { total: todayTotal, stats: todayStats } = await getStatisticsWithCache(
    relaychain,
    client,
    getTodayContributionsByFundIdsQuery,
    fundIds,
    new Date(cachedTime),
    `${prefix}.today`,
    60
  );
  const price = relaychain === Relaychain.KUSAMA ? await getKsmPrice() : await getDotPrice();
  const totalRaised = new BigNumber(totalBeforeToday.raised)
    .plus(new BigNumber(todayTotal.raised))
    .toNumber();

  const mergedTodayStatistics = getMergedTodayStatistics(todayStats, statsBeforeToday);

  const intersecionDates = intersection(
    map(statsBeforeToday, 'date'),
    map(mergedTodayStatistics, 'date')
  );
  const filteredStatsBeforeToday = filter(
    statsBeforeToday,
    item => item.date !== intersecionDates?.[0]
  );

  return {
    total: {
      raised: totalRaised,
      value: totalRaised * price,
      contributors: uniq(
        concat(totalBeforeToday.contributorAccounts, todayTotal?.contributorAccounts)
      ).length
    },
    stats: orderByTime([...filteredStatsBeforeToday, ...mergedTodayStatistics])
  };
};
