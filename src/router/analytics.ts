import express from 'express';

import { getPolkadotHistoricalTvl } from '../controller/contributionController';
import { handleGetMarketShareData } from '../controller/analyticsController';

const router = express.Router();

router.get('/polkadot/historical-tvl', getPolkadotHistoricalTvl);

router.get('/polkadot/market-share', handleGetMarketShareData);

export default router;
