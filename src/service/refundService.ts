import { getConnection, getManager, IsNull } from 'typeorm';

import { DotContribution } from '../entity/DotContribution';
import { RefundAction } from '../entity/RefundAction';
import { Crowdloan } from '../entity/Crowdloan';
import { CrowdloanStatus } from '../graphql/crowdloan';

import { Refund, RefundAction as Action, RefundActionStatus, RefundActionType } from './types';
import { DOT_UNIT, POSTGRES_BIG_INT } from './constants';

const isValidAmountForAction = (action: string, amount: string): boolean => {
  if (parseInt(amount) > POSTGRES_BIG_INT) {
    return false;
  }
  if (action === RefundActionType.REINVEST && parseInt(amount) >= DOT_UNIT * 5) {
    return true;
  } else if (action === RefundActionType.WITHDRAW && parseInt(amount) >= DOT_UNIT) {
    return true;
  } else {
    return false;
  }
};

const sumUpAmount = (items: { amount: string }[]): number =>
  items.map(item => parseInt(item.amount)).reduce((acc, curr) => acc + curr, 0);

const getRefundInfo = async (account: string): Promise<Refund> => {
  const refunds = await getAllRefunds(account);
  const refundActions = await getAllRefundActions(account);
  return calculateRefundInfoByRefundsAndActions(refunds, refundActions);
};

const calculateRefundInfoByRefundsAndActions = (
  refunds: DotContribution[],
  refundActions: RefundAction[]
): Refund => {
  const totalRefund = sumUpAmount(refunds);
  const reinvested = sumUpAmount(
    refundActions.filter(
      refundAction =>
        refundAction.action === RefundActionType.REINVEST &&
        refundAction.status !== RefundActionStatus.INVALID
    )
  );

  const allWithdrawals = refundActions.filter(
    refundAction =>
      refundAction.action === RefundActionType.WITHDRAW &&
      refundAction.status !== RefundActionStatus.INVALID
  );

  const totalWithdrew = sumUpAmount(
    allWithdrawals.filter(refundAction => refundAction.status === RefundActionStatus.SUCCESS)
  );

  const pendingWithdraw = sumUpAmount(
    allWithdrawals.filter(refundAction => refundAction.status !== RefundActionStatus.SUCCESS)
  );

  const refundAvailable = totalRefund - totalWithdrew - pendingWithdraw - reinvested;
  return {
    totalRefund,
    refundAvailable,
    reinvested,
    totalWithdrew,
    pendingWithdraw
  };
};

// Make sure the query logic is updated for saveRefundActionIfHaveEnoughRefund as well
const getAllRefunds = async (account: string): Promise<DotContribution[]> =>
  getConnection()
    .createQueryBuilder()
    .select(['dc.id', 'dc.amount', 'dc.block_height', 'dc.para_id', 'dc.account'])
    .from(DotContribution, 'dc')
    .innerJoin(Crowdloan, 'cl', 'dc.para_id = cl.para_id')
    .where('dc.account = :account', { account: account })
    .andWhere('cl.parallel_status = :parallelStatus', { parallelStatus: CrowdloanStatus.EXPIRED })
    .andWhere('dc.block_height >= cl.start_contribute_block')
    .andWhere('dc.block_height <= cl.end_contribute_block')
    .getMany();

const saveRefundActionIfHaveEnoughRefund = async (refundAction: Action): Promise<Refund> => {
  return getManager().transaction(async manager => {
    const refunds = await manager
      .createQueryBuilder()
      .select(['dc.id', 'dc.amount', 'dc.block_height', 'dc.para_id', 'dc.account'])
      .from(DotContribution, 'dc')
      .innerJoin(Crowdloan, 'cl', 'dc.para_id = cl.para_id')
      .where('dc.account = :account', { account: refundAction.account })
      .andWhere('cl.parallel_status = :parallelStatus', { parallelStatus: CrowdloanStatus.EXPIRED })
      .andWhere('dc.block_height >= cl.start_contribute_block')
      .andWhere('dc.block_height <= cl.end_contribute_block')
      .setLock('pessimistic_write')
      .getMany();

    const refundActions = await manager
      .getRepository(RefundAction)
      .createQueryBuilder('refundAction')
      .where('refundAction.account = :account', { account: refundAction.account })
      .setLock('pessimistic_write')
      .getMany();

    const refundInfo = calculateRefundInfoByRefundsAndActions(refunds, refundActions);
    if (refundInfo.refundAvailable >= parseInt(refundAction.amount)) {
      const currentRefundAction = await manager.getRepository(RefundAction).save({
        ...refundAction,
        status: RefundActionStatus.PENDING
      });
      return calculateRefundInfoByRefundsAndActions(refunds, [
        ...refundActions,
        currentRefundAction
      ]);
    }
    return Promise.reject(new Error('Not enough refund available'));
  });
};

const getAllRefundActions = async (account: string): Promise<RefundAction[]> =>
  RefundAction.find({
    where: {
      account: account
    }
  });

const getRefundActionsByIds = async (ids: string[]): Promise<RefundAction[]> =>
  RefundAction.findByIds(ids);

const getRefundActionsByExample = async (
  account: string,
  action: string,
  amount: string,
  paraId: number,
  timestamp: string,
  referralCode: string
): Promise<RefundAction[]> =>
  RefundAction.find({
    where: {
      account: account,
      action: action,
      amount: amount,
      paraId: paraId || IsNull(),
      timestamp: timestamp,
      referralCode: referralCode || IsNull()
    }
  });

export {
  getRefundInfo,
  saveRefundActionIfHaveEnoughRefund,
  isValidAmountForAction,
  getRefundActionsByExample,
  getRefundActionsByIds
};
