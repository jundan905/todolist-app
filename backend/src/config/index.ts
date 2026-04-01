const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`[Config] 필수 환경변수 누락: ${key}`);
    throw new Error(`필수 환경변수 누락: ${key}`);
  }
  return value;
};

export const config = {
  db: {
    url: requiredEnv('DATABASE_URL'),
    pool: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  },
  jwt: {
    secret: requiredEnv('JWT_SECRET'),
    expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
  },
  bcrypt: {
    costFactor: Number(process.env.BCRYPT_COST_FACTOR ?? 12),
  },
  cors: {
    origin: requiredEnv('CORS_ORIGIN'),
  },
};
