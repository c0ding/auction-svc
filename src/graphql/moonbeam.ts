import { gql } from 'graphql-request';

export interface MoonbeamTermsSigned {
  id: string;
  blockHeight: number;
  account: string;
  timestamp: Date;
}

export interface TMoonbeamTermsSigned {
  moonbeamTermsSigneds: {
    nodes: MoonbeamTermsSigned[];
  };
}

export interface MoonbeamRewardAddresses {
  id: string;
  blockHeight: number;
  account: string;
  rewardAddress: string;
  timestamp: Date;
}

export interface TMoonbeamRewardAddresses {
  moonbeamRewardAddresses: {
    nodes: MoonbeamRewardAddresses[];
  };
}

export const getMoonbeamRewardAddressByAccountQuery = gql`
  query ($account: String!) {
    moonbeamRewardAddresses(
      filter: { account: { equalTo: $account } }
      orderBy: BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        account
        timestamp
        rewardAddress
        blockHeight
      }
    }
  }
`;

export const getMoonbeamTermsSignedByAccountQuery = gql`
  query ($account: String!) {
    moonbeamTermsSigneds(filter: { account: { equalTo: $account } }, orderBy: BLOCK_HEIGHT_DESC) {
      nodes {
        id
        account
        timestamp
        blockHeight
      }
    }
  }
`;
