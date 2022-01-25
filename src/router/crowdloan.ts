import express, { Request } from 'express';
import { isEmpty, split } from 'lodash';

import { getCrowdloansFromSubvis, getMarketShare } from '../service/crowdloanService';
import { kusamaGraphQLClient, polkadotGraphQLClient } from '../graphqlClient';
import Relaychain from '../model/relaychain';
import { getStatistics } from '../service/statisticService';
import {
  handleGetPolkadotContributions,
  handleGetPolkadotCrowdloanData,
  handleGetStartedCrowdloanIds,
  handleGetPolkadotRewardDataOfAccount,
  handleSignRewardsDistribution,
  handleCheckIfSigned,
  handleGetRewardDistributionAddressMappings,
  handleGetMoonbeamSignedAddresses
} from '../controller/crowloanController';
import logger from '../logger';
import { getRewardsForKusama, getRewardsForPolkadotFromParallel } from '../service/rewardService';
import { getPolkadotHistoricalTvl, getTvlSummary } from '../controller/contributionController';
import { validateAccountParam } from '../middleware/validator';

const router = express.Router();

type StatisticsReqQuery = {
  fundIds: string;
};

router.get('/statistics/kusama', async (req: Request<any, any, any, StatisticsReqQuery>, res) => {
  const fundIds = split(req.query.fundIds, ',');

  if (isEmpty(fundIds)) {
    res.status(400).json('please provide fund ids.');
  } else {
    try {
      const result = await getStatistics(kusamaGraphQLClient, fundIds, Relaychain.KUSAMA);
      res.status(200).json({ ...result });
    } catch (error) {
      res.status(500).json('Something wrong, please try again...');
    }
  }
});

router.get('/statistics/polkadot', async (req: Request<any, any, any, StatisticsReqQuery>, res) => {
  const fundIds = split(req.query.fundIds, ',');

  if (isEmpty(fundIds)) {
    res.status(500).json('please provide fund ids.');
  } else {
    try {
      const result = await getStatistics(polkadotGraphQLClient, fundIds, Relaychain.POLKADOT);
      res.status(200).json({ ...result });
    } catch (error) {
      res.status(500).json('Something wrong, please try again...');
    }
  }
});

router.get('/kusama', async (_, res) => {
  try {
    const data = await getCrowdloansFromSubvis(kusamaGraphQLClient, Relaychain.KUSAMA);
    res.status(200).json(data);
  } catch (_) {
    res.status(500);
  }
});

router.get('/polkadot', async (_, res) => {
  try {
    const data = await getCrowdloansFromSubvis(polkadotGraphQLClient, Relaychain.POLKADOT);
    res.status(200).json(data);
  } catch (_) {
    res.status(500);
  }
});

router.get('/polkadot/v2', handleGetPolkadotCrowdloanData);

router.get(
  '/polkadot/v2/rewards/:account',
  validateAccountParam,
  handleGetPolkadotRewardDataOfAccount
);

router.post('/polkadot/v2/rewards/:account/sign', handleSignRewardsDistribution);

router.get('/polkadot/v2/rewards/:account/signed', handleCheckIfSigned);

router.post('/polkadot/v2/address-mappings', handleGetRewardDistributionAddressMappings);

router.get('/polkadot/moonbean/signed-addresses', handleGetMoonbeamSignedAddresses);

router.get('/rewards/kusama/:account', async (req, res) => {
  try {
    const data = await getRewardsForKusama(kusamaGraphQLClient, req.params.account);
    res.status(200).json(data);
  } catch (_) {
    res.status(500);
  }
});

router.get('/rewards/polkadot/:account', async (req, res) => {
  try {
    const data = await getRewardsForPolkadotFromParallel(req.params.account);
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Failed to get polkadot rewards data for account: ${req.params.account}`, error);
    res.status(500);
  }
});

router.get('/polkadot/contributions', handleGetPolkadotContributions);

router.get('/total-value', getTvlSummary);

// TODO: check if this is only used in analytics.parallel.fi. if yes, please remove this after using the new endpoint in frontend.
router.get('/historical-tvl', getPolkadotHistoricalTvl);

router.get('/polkadot/auction/started-crowdloans/ids', handleGetStartedCrowdloanIds);

// TODO: check if this is only used in analytics.parallel.fi. if yes, please remove this after using the new endpoint in frontend.
router.get('/marketshare/:account', async (_req, res) => {
  try {
    const data = await getMarketShare(polkadotGraphQLClient, _req.params.account);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

export default router;
