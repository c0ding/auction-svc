import { format, transports, createLogger } from 'winston';

import { getTransactionId } from '../middleware/localStorage';

const { combine, timestamp, json } = format;

const addTransactionId = format(info => ({
  transaction_id: getTransactionId,
  ...info
}));

const addErrorStack = format(info => {
  const error = info.error || info.err;
  if (error && error instanceof Error) {
    return {
      errorStack: error.stack && error.stack.split('\n'),
      ...info
    };
  }
  return info;
});

const logger = createLogger({
  format: combine(timestamp(), addTransactionId(), addErrorStack(), json()),
  transports: [new transports.Console()]
});

export default logger;
