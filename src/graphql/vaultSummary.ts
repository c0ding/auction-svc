import { gql } from 'graphql-request';

export interface VaultSummary {
  id: string;
  amount: string;
}

export interface TDataVaultSummary {
  vaultSummaries: {
    nodes: VaultSummary[];
  };
}

export const getVaultSummariesQuery = gql`
  query {
    vaultSummaries {
      nodes {
        id
        amount
      }
    }
  }
`;
