import mongoose from 'mongoose';
import { createConnection } from 'typeorm';

import app from './app';
import getConfig from './config';
import { DotContribution } from './entity/DotContribution';
import { RefundAction } from './entity/RefundAction';
import { Crowdloan } from './entity/Crowdloan';
import { RewardDistributionWhitelist } from './entity/RewardDistributionWhitelist';
import { RewardDistributionAddressMapping } from './entity/RewardDistributionAddressMapping';
import { MoonbeamTermsSigned } from './entity/MoonbeamTermsSigned';
import { UserProjectRewardInfo } from './entity/UserProjectRewardInfo';

const main = async () => {
  const { referralDB, polkadotAuctionDB } = getConfig();
  const connectUrl = `mongodb://${referralDB.host}/${referralDB.name}`;
  const connectOptions = {
    authSource: referralDB.authSource,
    auth: {
      username: referralDB.user,
      password: referralDB.password
    }
  };

  try {
    await mongoose.connect(connectUrl, connectOptions);
    console.log('mongoose connection successfully.');
  } catch (error) {
    console.error(error);
  }

  try {
    await createConnection({
      type: 'postgres',
      host: polkadotAuctionDB.host,
      port: polkadotAuctionDB.port,
      database: polkadotAuctionDB.name,
      username: polkadotAuctionDB.user,
      password: polkadotAuctionDB.password,
      entities: [
        DotContribution,
        RefundAction,
        Crowdloan,
        RewardDistributionWhitelist,
        RewardDistributionAddressMapping,
        MoonbeamTermsSigned,
        UserProjectRewardInfo
      ],
      extra: {
        poolSize: 200
      }
    });
    console.log('postgres connection successfully.');
  } catch (error) {
    console.error(error);
  }
};

main();

const port = 3000;

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
