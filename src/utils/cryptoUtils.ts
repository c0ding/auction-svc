import {
  cryptoWaitReady,
  decodeAddress,
  encodeAddress,
  signatureVerify
} from '@polkadot/util-crypto';

import SS58Format from '../model/ss58Format';

const { u8aToHex } = require('@polkadot/util');

const isValidSignature = (signedMessage: string, signature: string, address: string): boolean => {
  const publicKey = decodeAddress(address);
  const hexPublicKey = u8aToHex(publicKey);

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
};

const validateSignature = async (
  signedMessage: string,
  signature: string,
  address: string
): Promise<boolean> => {
  await cryptoWaitReady();
  return isValidSignature(signedMessage, signature, address);
};

const getPolkadotAccount = (account: string): string => {
  return encodeAddress(decodeAddress(account), SS58Format.POLKADOT_SS58_FORMAT);
};

export { validateSignature, getPolkadotAccount };
