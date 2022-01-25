import { Request, Response } from 'express';

import logger from '../logger';
import {
  getTotalValueContributed,
  getTotalValueContributedHistorical
} from '../service/contributionService';
import { getCacheOrUpdate } from '../service/redisService';

export const getTvlSummary = async (_: Request, res: Response) => {
  try {
    const data = await getCacheOrUpdate('TvlSummary', getTotalValueContributed, {});
    res.status(200).json(data);
  } catch (err) {
    logger.error('Get total value failed', { err });
    res.status(500);
  }
};

export const getPolkadotHistoricalTvl = async (_: Request, res: Response) => {
  try {
    const data = await getCacheOrUpdate('HistoricalTvl', getTotalValueContributedHistorical, {});
    res.status(200).json(data);
  } catch (err) {
    logger.error('Get total value failed', { err });
    res.status(500);
  }
};
