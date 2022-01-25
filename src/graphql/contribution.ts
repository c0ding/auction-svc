import { gql } from 'graphql-request';

export interface Contribution {
  id: string;
  fundId: string;
  account: string;
  amount: string;
  createdAt: string;
  blockNum: number;
  parachain?: {
    paraId: number;
  };
  fund?: {
    status: string;
    blockNum: number;
    lockExpiredBlock: number;
  };
}

export interface TDataContribution {
  contributions: {
    nodes: Contribution[];
  };
}

export interface DotContribution {
  id: string;
  paraId: number;
  account: string;
  amount: string;
  timestamp: string;
  referralCode: string;
  blockHeight: number;
  executedBlockHeight: number;
}

export interface TDataDotContribution {
  dotContributions: {
    nodes: DotContribution[];
  };
}

export const getContributionsBeforeTodayByFundIdsQuery = gql`
  query ($fundIds: [String!], $today: Datetime) {
    contributions(filter: { fundId: { in: $fundIds }, createdAt: { lessThan: $today } }) {
      nodes {
        id
        fundId
        account
        amount
        createdAt
      }
    }
  }
`;

export const getTodayContributionsByFundIdsQuery = gql`
  query ($fundIds: [String!], $today: Datetime) {
    contributions(
      filter: { fundId: { in: $fundIds }, createdAt: { greaterThanOrEqualTo: $today } }
    ) {
      nodes {
        id
        fundId
        account
        amount
        createdAt
      }
    }
  }
`;

export const getContributionsByAccountQuery = gql`
  query ($account: String!) {
    contributions(filter: { account: { equalTo: $account } }) {
      nodes {
        id
        amount
        fundId
        parachain {
          paraId
        }
        fund {
          status
          blockNum
          lockExpiredBlock
        }
      }
    }
  }
`;

export const getContributionsByAccountsQuery = gql`
  query ($accounts: [String!]) {
    contributions(filter: { account: { in: $accounts } }) {
      nodes {
        amount
        account
        fundId
        fund {
          status
        }
      }
    }
  }
`;

export const getDotContributionsByAccountQuery = gql`
  query ($account: String!) {
    dotContributions(
      filter: {
        or: [
          { account: { equalTo: $account }, isValid: { equalTo: true } }
          { account: { equalTo: $account }, paraId: { equalTo: 2004 } }
        ]
      }
    ) {
      nodes {
        id
        paraId
        amount
        account
        timestamp
        blockHeight
        referralCode
        executedBlockHeight
      }
    }
  }
`;

export const getDotContributionsByReferralCodeQuery = gql`
  query ($referralCode: String!) {
    dotContributions(
      filter: { referralCode: { equalTo: $referralCode }, and: { isValid: { equalTo: true } } }
    ) {
      nodes {
        id
        paraId
        amount
        account
        timestamp
        blockHeight
        referralCode
        executedBlockHeight
      }
    }
  }
`;
