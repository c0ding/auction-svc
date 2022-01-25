import express from 'express';
import cors from 'cors';

import referralRouter from './router/referral';
import crowdloanRouter from './router/crowdloan';
import moonbeamRouter from './router/moonbeam';
import refundRouter from './router/refund';
import analyticsRouter from './router/analytics';
import { clientErrorHandler, serverErrorHandler, errorHandler } from './errors';
import localStorageMiddleware from './middleware/localStorage';

const app = express();
app.use(express.json());
app.use(cors());

app.use(localStorageMiddleware);

app.use('/referral', referralRouter);
app.use('/crowdloan', crowdloanRouter);
app.use('/moonbeam', moonbeamRouter);
app.use('/refund', refundRouter);
app.use('/analytics', analyticsRouter);
app.use('/heartbeat', (_, res) => {
  res.status(200).json('Ok');
});

app.use(clientErrorHandler);
app.use(serverErrorHandler);
app.use(errorHandler);

export default app;
