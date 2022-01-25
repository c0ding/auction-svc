import { getPolkadotAccount } from '../utils/cryptoUtils';
import {
  TMoonbeamRewardAddresses,
  TMoonbeamTermsSigned,
  getMoonbeamRewardAddressByAccountQuery,
  getMoonbeamTermsSignedByAccountQuery
} from '../graphql/moonbeam';
import { moonbeamParallelGraphQLClient } from '../graphqlClient';

export const getMoonbeamRewardAddressOfAddress = async (account: string) => {
  const {
    moonbeamRewardAddresses: { nodes }
  } = await moonbeamParallelGraphQLClient.request<TMoonbeamRewardAddresses>(
    getMoonbeamRewardAddressByAccountQuery,
    {
      account: getPolkadotAccount(account)
    }
  );
  return nodes;
};

export const getMoonbeamTermsSignedOfAddress = async (account: string) => {
  const {
    moonbeamTermsSigneds: { nodes }
  } = await moonbeamParallelGraphQLClient.request<TMoonbeamTermsSigned>(
    getMoonbeamTermsSignedByAccountQuery,
    {
      account: getPolkadotAccount(account)
    }
  );
  return nodes;
};
