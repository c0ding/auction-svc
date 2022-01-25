import Redis from 'ioredis';

import getConfig from '../config';
import logger from '../logger';

const { redisEndpoint } = getConfig();
const redis = new Redis(redisEndpoint);

const getCache = async (key: string) => {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    logger.error('Errors when getting cache', { err });
    return null;
  }
};

const setCache = async (key: string, value: any, time: number = 10) => {
  try {
    const result = await redis.set(key, JSON.stringify(value), 'EX', time);
    return result;
  } catch (err) {
    // TODO: add monitor when it's error;
    logger.error('Errors when setting cache', { err });
    return null;
  }
};

type UpdateFunctionParams = Record<string, any>;

type UpdateFunction<Result> = (params: any) => Promise<Result>;

const SECOND_TIER_CACHE_SUFFIX = '-second-tier';
const LOCK_SUFFIX = '-lock';

const updateCache = async <Result>(
  key: string,
  updateFunction: UpdateFunction<Result>,
  param: UpdateFunctionParams,
  expirationSeconds: number
): Promise<Result> => {
  const lockKey = `${key}${LOCK_SUFFIX}`;
  try {
    logger.info('Update cache for redis key', { key });
    const lockResult = await redis.setnx(lockKey, 1);
    if (!lockResult) {
      logger.info('Other process is updating the cache');
      return Promise.resolve({} as Result);
    }
    const result: Result = await updateFunction(param);
    const value = JSON.stringify(result);
    await redis.set(key, value, 'EX', expirationSeconds);
    await redis.set(`${key}${SECOND_TIER_CACHE_SUFFIX}`, value);
    return Promise.resolve(result);
  } catch (err) {
    // There is an issue here and we need to take care of
    // May happen when the downstream system is unavailable for now.
    logger.error('Errors when updating cache', { err });
    return Promise.resolve({} as Result);
  } finally {
    await redis.del(lockKey);
  }
};

// Assumption:
//  1. The data saved in redis is able to stringify and parse.
//  2. The result could be convert to Result type successfully. We need this unless we could have a method to convert it.
const getCacheOrUpdate = async <Result>(
  key: string,
  updateFunction: UpdateFunction<Result>,
  param: UpdateFunctionParams,
  expirationSeconds: number = 10
): Promise<Result> => {
  const firstCatchResult = await redis.get(key);
  if (firstCatchResult) {
    logger.info('Read first layer cache', { key });
    return JSON.parse(firstCatchResult) as Result;
  }
  const secondCatchResult = await redis.get(`${key}${SECOND_TIER_CACHE_SUFFIX}`);
  if (secondCatchResult) {
    logger.info('Read second layer cache', { key });
    updateCache(key, updateFunction, param, expirationSeconds);
    return JSON.parse(secondCatchResult) as Result;
  } else {
    const result = await updateCache(key, updateFunction, param, expirationSeconds);
    return result;
  }
};

export { getCache, setCache, getCacheOrUpdate };
