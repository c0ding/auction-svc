import { chain, get } from 'lodash';
import moment from 'moment-timezone';
import axios from 'axios';

import { heikoCrowdloanGraphQLClient } from '../graphqlClient';
import { getVaultSummariesQuery, TDataVaultSummary } from '../graphql/vaultSummary';
import logger from '../logger';
import unitToBalance from '../utils/calculation';

import { getNonExpiredDotContributions, getTotalRaised } from './crowdloanService';
import { getCacheOrUpdate } from './redisService';
import { getDotPrice, getGlmrPrice, getKsmPrice } from './pricesService';

const subscanApiKey = '9550da8690d2f58ccf1c8c265ba076e1';
interface SubscanResponse {
  data: {
    address: string;
    balance: string;
  };
}

const geVaultSummaries = async () => {
  const updateFunction = async () => {
    const {
      vaultSummaries: { nodes }
    } = await heikoCrowdloanGraphQLClient.request<TDataVaultSummary>(getVaultSummariesQuery);
    return getTotalRaised(nodes).dividedBy(1e12).toNumber();
  };

  return getCacheOrUpdate('total.ksm', updateFunction, {});
};

const getBalanceFromSubscan = async (network: string, account: string) => {
  const { data } = await axios.post<SubscanResponse>(
    `https://${network}.api.subscan.io/api/v2/scan/search`,
    {
      key: account
    },
    {
      headers: {
        'X-API-Key': subscanApiKey
      }
    }
  );
  return get(data, 'data.account.balance');
};

const getTotalGLMRBalance = async () => {
  logger.info('Start to get GLMR balance');
  const lockedBalance =
    unitToBalance('14558055031896636374048458', 18) *
    0.7 *
    (1 - moment().diff('2021-12-17', 'd') / (96 * 7));
  const balance1 = await getBalanceFromSubscan(
    'moonbeam',
    '0x1F695652967615cdE319FDF59dD65B22c380EDC1'
  );
  const balance2 = await getBalanceFromSubscan(
    'moonbeam',
    '0x508eb96dc541c8e88a8a3fce4618b5fb9fa3f209'
  );
  return parseFloat(balance1) + parseFloat(balance2) + lockedBalance;
};

const getTotalACABalance = async () => {
  const balance1 = await getBalanceFromSubscan(
    'acala',
    '1Gu7GSgLSPrhc1Wci9wAGP6nvzQfaUCYqbfXxjYjMG9bob6'
  );
  const balance2 = await getBalanceFromSubscan(
    'acala',
    '14VUv8UR4uGsmXttUc2wzAtc3jV3zktehUDwcTHi5hB96TzF'
  );
  return parseFloat(balance1) + parseFloat(balance2);
};

const getRestDOTBalance = async () => {
  const balance = await getBalanceFromSubscan(
    'polkadot',
    '5FW9PFNF2HcvprtXh845hqZ4fUyhzTjiobboZ53QnmFxAidy'
  );
  return parseFloat(balance);
};

export const getTotalValueContributed = async () => {
  const dotPrice = await getDotPrice();
  const ksmPrice = await getKsmPrice();
  const glmrPrice = await getGlmrPrice();
  const acaPrice = 0;

  const dotContributions = await getNonExpiredDotContributions();
  const raisedDot = getTotalRaised(dotContributions).dividedBy(1e10).toNumber();
  const refundRestDot = await getRestDOTBalance();

  const totalVaultSummaries = await geVaultSummaries();
  const totalKsm = totalVaultSummaries + 57300;

  const totalGlmr = await getTotalGLMRBalance();
  const totalAca = await getTotalACABalance();

  const totalDot = refundRestDot + raisedDot;

  const totalValue =
    totalDot * dotPrice + totalKsm * ksmPrice + totalGlmr * glmrPrice + totalAca * acaPrice;

  const items = [
    {
      token: 'DOT',
      amount: totalDot,
      price: dotPrice
    },
    {
      token: 'KSM',
      amount: totalKsm,
      price: ksmPrice
    },
    {
      token: 'GLMR',
      amount: totalGlmr,
      price: glmrPrice
    },
    {
      token: 'ACA',
      amount: totalAca,
      price: 0
    }
  ];

  return {
    totalValue,
    totalDot, // TODO: delete it once unused
    dotPrice, // TODO: delete it once unused
    totalKusama: totalKsm, // TODO: delete it once unused
    kusamaPrice: ksmPrice, // TODO: delete it once unused
    items
  };
};

export const getTotalValueContributedHistorical = async () => {
  const dotContributions = await getNonExpiredDotContributions();
  const byDay = (data: { timestamp: string }) => {
    return moment(data.timestamp).utc().format('MMM DD, YYYY');
  };
  return chain(dotContributions)
    .filter('timestamp')
    .orderBy('timestamp')
    .groupBy(byDay)
    .reduce((acc, value, key) => ({ ...acc, [key]: getTotalRaised(value) }), {});
};
