import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { ReferralModel } from '../src/model/referral';
import { CrowdloanModel } from '../src/model/crowdloan';

const mongoServer = MongoMemoryServer.create();

export const connect = async () => {
  const mongod = await mongoServer;
  const uri = mongod.getUri();

  await mongoose.connect(uri);
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  const mongod = await mongoServer;
  await mongod.stop();
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export const insertData = async () => {
  await ReferralModel.create([
    { address: 'referrer-address', referralCode: 'referrer-code' },
    { address: 'contributor-address', referralCode: 'contributor-code' }
  ]);
  await CrowdloanModel.create([
    {
      account: 'referrer-address',
      referralCode: null,
      amount: 1000,
      paraId: 2013,
      timestamp: '1629390144011'
    },
    {
      account: 'referrer-address',
      referralCode: 'contributor-code',
      amount: 1000,
      paraId: 2013,
      timestamp: '1629391566006'
    },
    {
      account: 'contributor-address',
      referralCode: 'referrer-code',
      amount: 1000,
      paraId: 2014,
      timestamp: '1634637298000'
    },
    {
      account: 'contributor-address',
      referralCode: 'referrer-code',
      amount: 3000,
      paraId: 2013,
      timestamp: '1634637298000'
    },
    {
      account: 'contributor-address',
      referralCode: null,
      amount: 1000,
      paraId: 2014,
      timestamp: '1634637298000'
    }
  ]);
};
