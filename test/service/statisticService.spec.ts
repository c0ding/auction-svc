import { getContributionStatistics } from '../../src/service/statisticService';
import { Contribution } from '../../src/graphql/contribution';
import Relaychain from '../../src/model/relaychain';

jest.mock('../../src/service/redisService', () => ({
  getCache: () => jest.fn(),
  setCache: () => jest.fn()
}));

export const mockedContributions: Contribution[] = [
  {
    id: 'id1',
    fundId: 'fundId1',
    account: 'account1',
    amount: '1000000000000',
    createdAt: '2021-08-20T21:35:54.002',
    blockNum: 8858588
  },
  {
    id: 'id2',
    fundId: 'fundId2',
    account: 'account2',
    amount: '1000000000000',
    createdAt: '2021-10-19T21:35:54.002',
    blockNum: 8858588
  },
  {
    id: 'id3',
    fundId: 'fundId2',
    account: 'account2',
    amount: '1000000000000',
    createdAt: '2021-10-30T21:35:54.002',
    blockNum: 8858588
  }
];

describe('statisticsService', () => {
  describe('getContributionStatistics', () => {
    it('should return an array of stats', () => {
      const result = getContributionStatistics(
        mockedContributions,
        ['fundId1', 'fundId2'],
        Relaychain.POLKADOT
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { date: 'Aug 21, 2021', fundId1: 100, fundId2: 0 },
        { date: 'Oct 20, 2021', fundId1: 100, fundId2: 100 },
        { date: 'Oct 31, 2021', fundId1: 100, fundId2: 200 }
      ]);
    });

    it('should return an array with 0 for the fundId which does not have contributions', () => {
      const result = getContributionStatistics(
        mockedContributions,
        ['fundId1', 'fundId2', 'fundId3'],
        Relaychain.POLKADOT
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { date: 'Aug 21, 2021', fundId1: 100, fundId2: 0, fundId3: 0 },
        { date: 'Oct 20, 2021', fundId1: 100, fundId2: 100, fundId3: 0 },
        { date: 'Oct 31, 2021', fundId1: 100, fundId2: 200, fundId3: 0 }
      ]);
    });
  });
});
