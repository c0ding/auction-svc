import { getStringEnv, getNumEnv } from './getEnv';

interface ReferralDBConfig {
  host: string;
  name: string;
  user: string;
  password: string;
  authSource: string;
}

interface Subvis {
  kusamaEndpoint: string;
  polkadotEndpoint: string;
}

interface Parallel {
  moonbeamEndpoint: string;
  polkadotEndpoint: string;
  heikoCrowdloanSubqueryEndpoint: string;
}

interface PolkadotAuctionDBConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

interface Config {
  referralDB: ReferralDBConfig;
  polkadotAuctionDB: PolkadotAuctionDBConfig;
  subvis: Subvis;
  parallel: Parallel;
  priceEndpoint: string;
  redisEndpoint: string;
}

const getConfig = (): Config => ({
  referralDB: {
    authSource: getStringEnv('MONGO_DB_AUTH_SOURCE') || getStringEnv('MONGO_DB_NAME'),
    host: getStringEnv('MONGO_DB_HOST'),
    name: getStringEnv('MONGO_DB_NAME'),
    user: getStringEnv('MONGO_DB_USER'),
    password: getStringEnv('MONGO_DB_PASSWORD')
  },
  polkadotAuctionDB: {
    host: getStringEnv('POSTGRES_DB_HOST'),
    port: getNumEnv('POSTGRES_DB_PORT'),
    name: getStringEnv('POSTGRES_DB_NAME'),
    user: getStringEnv('POSTGRES_DB_USER'),
    password: getStringEnv('POSTGRES_DB_PASSWORD')
  },
  subvis: {
    kusamaEndpoint: getStringEnv('SUBVIS_KUSAMA_ENDPOINT'),
    polkadotEndpoint: getStringEnv('SUBVIS_POLKADOT_ENDPOINT')
  },
  parallel: {
    moonbeamEndpoint: getStringEnv('PARALLEL_MOONBEAM_SUBQUERY_ENDPOINT'),
    polkadotEndpoint: getStringEnv('PARALLEL_POLKADOT_ENDPOINT'),
    heikoCrowdloanSubqueryEndpoint: getStringEnv('PARALLEL_HEIKO_CROWDLOAN_SUBQUERY_ENDPOINT')
  },
  priceEndpoint: getStringEnv('PRICE_ENDPOINT'),
  redisEndpoint: getStringEnv('REDIS_ENDPOINT')
});

export default getConfig;
