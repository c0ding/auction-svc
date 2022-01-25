import { Request, Response } from 'express';
import { isEmpty, split } from 'lodash';

import { polkadotGraphQLClient } from '../graphqlClient';
import { getMarketShareDataForAccounts } from '../service/analyticsService';

type MarketShareReqQuery = {
  accounts: string;
};

const handleGetMarketShareData = async (
  req: Request<any, any, any, MarketShareReqQuery>,
  res: Response
) => {
  const accounts = split(req.query.accounts, ',');

  if (isEmpty(accounts)) {
    res.status(500).json('please provide accounts.');
  } else {
    try {
      const data = await getMarketShareDataForAccounts(polkadotGraphQLClient, accounts);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json('Getting market share data for accounts failed, please try again...');
    }
  }
};

export { handleGetMarketShareData };
