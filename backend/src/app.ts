import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { config } from './config.js';
import { usersRouter } from './modules/users.routes.js';
import { productsRouter } from './modules/products.routes.js';
import { formsRouter } from './modules/forms.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'adminforge-api' }));
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/forms', formsRouter);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  const code = (error as { code?: string }).code;
  if (code === '23505') return void res.status(409).json({ message: 'Resource already exists' });
  if (code === '22P02') return void res.status(400).json({ message: 'Invalid identifier or value' });
  res.status(500).json({ message: 'Internal server error' });
};
app.use(errorHandler);
