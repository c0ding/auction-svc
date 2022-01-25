import { Request, Response, NextFunction } from 'express';
import { union, map, find } from 'lodash';

import {
  getStartedCrowdloanIds,
  getCrowdloansFromSubvis,
  getCrowdloanSummaries,
  getNonExpiredCrowdloanSummaries
} from '../service/crowdloanService';
import {
  checkIfInRewardDistributionWhitelist,
  insertToRewardDistributionWhitelist,
  getRewardDistributionAddressMappings,
  getMoonbeamSignedAddresses,
  getRewardInfoByAccount
} from '../service/rewardService';
import { polkadotGraphQLClient } from '../graphqlClient';
import Relaychain from '../model/relaychain';
import logger from '../logger';
import { getCacheOrUpdate } from '../service/redisService';

const handleGetStartedCrowdloanIds = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getStartedCrowdloanIds();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const handleGetPolkadotCrowdloanData = async (_req: Request, res: Response) => {
  const getPolkadotCrowdloanData = async () => {
    logger.info('Get polkadot crowdloans from subivs');
    const subvisCrowdloans = await getCrowdloansFromSubvis(
      polkadotGraphQLClient,
      Relaychain.POLKADOT
    );

    logger.info('Get polkadot crowdloans from postgres');
    const postgresCrowdloans = await getCrowdloanSummaries();

    logger.info('Merge polkadot crowdloans by crowdloan id');
    const allCrowdloanIds = union(map(subvisCrowdloans, 'id'), map(postgresCrowdloans, 'id'));
    const mergedCrowdloans = allCrowdloanIds.map(id => ({
      ...(find(subvisCrowdloans, { id }) || {}),
      ...(find(postgresCrowdloans, { id }) || {}),
      id
    }));
    return mergedCrowdloans;
  };

  try {
    const cacheKey = 'total.polkadot.crowdloans';
    const crowdloans = await getCacheOrUpdate(cacheKey, getPolkadotCrowdloanData, {}, 600);

    res.status(200).json(crowdloans);
  } catch (error) {
    logger.error('Getting polkadot crowdloan data failed: ', error);
    res.status(500);
  }
};

const handleGetPolkadotContributions = async (req: Request, res: Response) => {
  try {
    logger.info('Get polkadot crowdloans from postgres');
    const data = await getNonExpiredCrowdloanSummaries();
    const transformedData = map(data, item => ({
      paraId: item.paraId,
      total: item.parallelRaised,
      contributions: item.parallelContributions
    }));
    res.status(200).json(transformedData);
  } catch (error) {
    logger.error('Getting polkadot crowdloan data failed: ', error);
    res.status(500);
  }
};

const handleGetPolkadotRewardDataOfAccount = async (req: Request, res: Response) => {
  try {
    const data = await getRewardInfoByAccount(req.params.account);
    res.status(200).json(data);
  } catch (error) {
    logger.error('Getting rewards data for polkadot failed', { error });
    res.status(500).json({
      error: error
    });
  }
};

const handleSignRewardsDistribution = async (req: Request, res: Response) => {
  try {
    const { account } = req.params;
    logger.info('Checking if account signed', { account });
    const checkIfSigned = await checkIfInRewardDistributionWhitelist(account);
    if (checkIfSigned) {
      res.status(400).json({
        message: 'This account was already signed'
      });
    } else {
      logger.info('Inserting account to reward distribution whitelist');
      await insertToRewardDistributionWhitelist(account);
      res.status(200);
    }
  } catch (error) {
    logger.error('Signing reward distribution failed', { error });
    res.status(500).json({
      error: error
    });
  }
};

const handleCheckIfSigned = async (req: Request, res: Response) => {
  try {
    logger.info('Checking if account signed');
    const checkIfSigned = await checkIfInRewardDistributionWhitelist(req.params.account);
    res.status(200).json(checkIfSigned);
  } catch (error) {
    logger.error('Checking if account signed failed: ', error);
    res.status(500).json({
      error: error
    });
  }
};

const handleGetRewardDistributionAddressMappings = async (req: Request, res: Response) => {
  try {
    const { addresses } = req.body;
    logger.info('Getting reward distribution address mappings for addresses: ', addresses);
    const data = await getRewardDistributionAddressMappings(addresses);
    res.status(200).json(data);
  } catch (error) {
    logger.error('Getting reward distribution address mappings for addresses failed: ', error);
    res.status(500).json({
      error: error
    });
  }
};

const handleGetMoonbeamSignedAddresses = async (req: Request, res: Response) => {
  try {
    logger.info('Getting Moonbeam signed addresses');
    const data = await getMoonbeamSignedAddresses();
    res.status(200).json(data);
  } catch (error) {
    logger.error('Getting Moonbeam signed addresses failed: ', error);
    res.status(500).json({
      error: error
    });
  }
};

export {
  handleGetStartedCrowdloanIds,
  handleGetPolkadotCrowdloanData,
  handleGetPolkadotContributions,
  handleGetPolkadotRewardDataOfAccount,
  handleSignRewardsDistribution,
  handleCheckIfSigned,
  handleGetRewardDistributionAddressMappings,
  handleGetMoonbeamSignedAddresses
};
