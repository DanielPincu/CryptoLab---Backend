import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),

  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  FINNHUB_API_KEY: required('FINNHUB_API_KEY'),

  SYMBOLS: (process.env.SYMBOLS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  STARTING_CASH: Number(process.env.STARTING_CASH ?? 10000),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '365d'
};