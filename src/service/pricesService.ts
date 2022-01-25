import axios from 'axios';
import { get } from 'lodash';

import getConfig from '../config';
import logger from '../logger';

import { getCacheOrUpdate } from './redisService';

export enum Coins {
  POLKADOT = 'dot',
  KUSAMA = 'ksm',
  MOONBEAM = 'glmr'
}

const queryPrice = async ({ coin }: { coin: string }): Promise<number> => {
  logger.info('Get price', { coin });
  const requestUrl = `${getConfig().priceEndpoint}?currency=${coin}`;
  const result = await axios.get(requestUrl);
  const currentPrice = get(result, 'data.data.rates.USD');
  return currentPrice;
};

const getPrice = async (coin: string): Promise<number> => {
  return getCacheOrUpdate(coin, queryPrice, { coin });
};

export const getDotPrice = async (): Promise<number> => getPrice(Coins.POLKADOT);
export const getKsmPrice = async (): Promise<number> => getPrice(Coins.KUSAMA);
export const getGlmrPrice = async (): Promise<number> => getPrice(Coins.MOONBEAM);
