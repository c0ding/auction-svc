import BigNumber from 'bignumber.js';

const unitToBalance = (amount: number | string, decimal: number) => {
  const base = new BigNumber(10).pow(decimal);
  return new BigNumber(amount).dividedBy(base).toNumber();
};

export default unitToBalance;
