import { CrowdloanStatus } from '../graphql/crowdloan';

export type Refund = {
  totalRefund: number;
  refundAvailable: number;
  reinvested: number;
  totalWithdrew: number;
  pendingWithdraw: number;
};

export type RefundAction = {
  account: string;
  action: string;
  amount: string;
  paraId: number;
  signature: string;
  signedMessage: string;
  referralCode: string;
};

export enum RefundActionStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAIL = 'Fail',
  VERIFIED = 'Verified',
  INVALID = 'Invalid',
  COMMITTED = 'Committed'
}

export enum RefundActionType {
  REINVEST = 'Reinvest',
  WITHDRAW = 'Withdraw'
}

export type RefundRequestBodyType = {
  signature: string;
  payload: {
    amount: string;
    paraId?: number;
    referralCode?: string;
    action: RefundActionType;
    timestamp: string;
  };
};

export type Crowdloan = {
  id: string;
  amount: string;
  account: string;
  paraId: number;
  status: CrowdloanStatus;
  timestamp: string;
};

export type CrowdloanSummary = {
  id: string;
  paraId: number;
  parallelContributions: number;
  parallelRaised: string;
  status: CrowdloanStatus;
};
