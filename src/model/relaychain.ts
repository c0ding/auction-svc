enum Relaychain {
  POLKADOT = 'polkadot',
  KUSAMA = 'kusama'
}

export const CHAIN_CONFIG = {
  [Relaychain.POLKADOT]: {
    unit: 'DOT'
  },
  [Relaychain.KUSAMA]: {
    unit: 'KSM'
  }
};

export const RAW_DECIMALS = {
  DOT: 10,
  KSM: 12,
  USDT: 6,
  xKSM: 12,
  xDOT: 10,
  HKO: 12,
  PARA: 12,
  rate: 18,
  ratio: 6,
  oracle: 18
};

export default Relaychain;
