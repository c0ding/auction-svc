import { isValidAmountForAction } from '../refundService';

describe('refundService', () => {
  describe('isValidAmountForAction', () => {
    it('Should return true given Withdraw and 100,000,000,000', () => {
      const isValid = isValidAmountForAction('Withdraw', '100000000000');
      expect(isValid).toBeTruthy();
    });
    it('Should return true given Withdraw and 10,000,000,000', () => {
      const isValid = isValidAmountForAction('Withdraw', '10000000000');
      expect(isValid).toBeTruthy();
    });

    it('Should return false given Withdraw and 5,000,000,000', () => {
      const isValid = isValidAmountForAction('Withdraw', '5000000000');
      expect(isValid).toBeFalsy();
    });

    it('Should return true given Withdraw and 100,000,000,000', () => {
      const isValid = isValidAmountForAction('Reinvest', '100000000000');
      expect(isValid).toBeTruthy();
    });
    it('Should return false given Withdraw and 10,000,000,000', () => {
      const isValid = isValidAmountForAction('Reinvest', '10000000000');
      expect(isValid).toBeFalsy();
    });

    it('Should return false given Withdraw and 5,000,000,000', () => {
      const isValid = isValidAmountForAction('Reinvest', '5000000000');
      expect(isValid).toBeFalsy();
    });
  });
});
