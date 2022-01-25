import { GraphQLClient } from 'graphql-request';

import getConfig from './config';

export const kusamaGraphQLClient = new GraphQLClient(getConfig().subvis.kusamaEndpoint, {
  headers: {}
});

export const polkadotGraphQLClient = new GraphQLClient(getConfig().subvis.polkadotEndpoint, {
  headers: {}
});

export const polkadotParallelGraphQLClient = new GraphQLClient(
  getConfig().parallel.polkadotEndpoint,
  {
    headers: {}
  }
);

export const moonbeamParallelGraphQLClient = new GraphQLClient(
  getConfig().parallel.moonbeamEndpoint,
  {
    headers: {}
  }
);

export const heikoCrowdloanGraphQLClient = new GraphQLClient(
  getConfig().parallel.heikoCrowdloanSubqueryEndpoint,
  {
    headers: {}
  }
);
