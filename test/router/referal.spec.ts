import supertest from 'supertest';

import app from '../../src/app';
import * as db from '../db';

jest.mock('@polkadot/keyring');
jest.mock('../../src/graphqlClient', () => ({
  kusamaGraphQLClient: { request: () => jest.fn() },
  polkadotGraphQLClient: { request: () => jest.fn() },
  polkadotParallelGraphQLClient: { request: () => jest.fn }
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

describe('Referral router', () => {
  const appTest = supertest(app);

  it('should create the referralCode when call the /referral first time', async () => {
    const res = await appTest.post('/referral').send({
      address: 'address'
    });

    expect(res.status).toBe(200);
    expect(res.body.referralCode).toBeDefined();
  });

  it('should return the same referralCode when call the /referral second time', async () => {
    const res = await appTest.post('/referral').send({
      address: 'address'
    });

    expect(res.status).toBe(200);
    expect(res.body.referralCode).toBeDefined();

    const referralCode = res.body.referralCode;
    const res2 = await appTest.post('/referral').send({
      address: 'address'
    });

    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ referralCode });
  });

  it('should return 400 when given an empty address', async () => {
    const res = await appTest.post('/referral').send({
      address: ''
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when the address is not present', async () => {
    const res = await appTest.post('/referral');

    expect(res.status).toBe(400);
  });

  it('should return 200 when call the /referral/referrer-code/check given it is a valid referral code', async () => {
    await db.insertData();
    const res = await appTest.get('/referral/referrer-code/check');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ address: 'referrer-address', referralCode: 'referrer-code' });
  });

  it('should return 404 when call the /referral/00000/check given it is a non exist referral code', async () => {
    const res = await appTest.get('/referral/00000/check');
    expect(res.status).toBe(404);
  });

  it('should return correct bonus when call the /referral/:address/heiko-bonus', async () => {
    await db.insertData();
    const res = await appTest.get('/referral/referrer-address/heiko-bonus');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ bonus: '0' });
  });
});
