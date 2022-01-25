import { gql } from 'graphql-request';

export enum CrowdloanStatus {
  WON = 'Won',
  STARTED = 'Started',
  EXPIRED = 'Expired',
  CLOSED = 'Closed'
}

export interface CrowdloanNode {
  id: string;
  cap: string;
  raised: string;
  lockExpiredBlock: number;
  blockNum: number;
  firstSlot: number;
  lastSlot: number;
  status: string;
  isFinished: boolean;
  wonAuctionId: string | null;
  parachain: {
    paraId: number;
  };
  contributions: {
    totalCount: number;
  };
}

export interface TDataCrowdloan {
  crowdloans: {
    nodes: Array<CrowdloanNode>;
  };
}

export const getNotDissolvedCrowloansQuery = gql`
  query {
    crowdloans(filter: { status: { notEqualTo: "Dissolved" } }) {
      nodes {
        id
        cap
        raised
        lockExpiredBlock
        blockNum
        firstSlot
        lastSlot
        status
        isFinished
        wonAuctionId
        parachain {
          paraId
        }
        contributions {
          totalCount
        }
      }
    }
  }
`;

export const getSubvisStartedCrowloansQuery = gql`
  query {
    crowdloans(filter: { status: { equalTo: "Started" } }) {
      nodes {
        id
        parachain {
          paraId
        }
      }
    }
  }
`;
