import supertest from 'supertest';

import app from '../../src/app';
import * as db from '../db';

const mockedStats = {
  total: {
    raised: 8900,
    value: 909080,
    contributors: 234
  },
  stats: [
    {
      date: 'Nov 21, 2021',
      fundId1: 300,
      fundId2: 400
    }
  ]
};

jest.mock('../../src/service/statisticService', () => ({
  getStatistics: () => mockedStats
}));

jest.mock('../../src/service/redisService', () => ({
  getCache: () => jest.fn(),
  setCache: () => jest.fn()
}));

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase();
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Crowdloan router', () => {
  const appTest = supertest(app);
  it('should return total raised and total contributor when call the /crowdloan/kusama-statistics', async () => {
    const res = await appTest.get('/crowdloan/statistics/kusama/?fundIds=fundId1,fundId2');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockedStats);
  });
});
