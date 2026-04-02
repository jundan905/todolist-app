process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:5173';

import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../../src/middlewares/authMiddleware';
import { errorMiddleware } from '../../../src/middlewares/errorMiddleware';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/protected', authMiddleware, (req: any, res: any) => {
    res.json({ userId: req.user?.userId });
  });
  app.use(errorMiddleware);
  return app;
};

describe('authMiddleware', () => {
  const secret = 'test-secret';

  it('유효한 토큰 → req.user 설정 + 200', async () => {
    const token = jwt.sign({ userId: 'uuid-123', email: 'a@b.com' }, secret, { algorithm: 'HS256' });
    const res = await request(makeApp()).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('uuid-123');
  });

  it('Authorization 헤더 없음 → 401', async () => {
    const res = await request(makeApp()).get('/protected');
    expect(res.status).toBe(401);
  });

  it('잘못된 토큰 → 401', async () => {
    const res = await request(makeApp()).get('/protected').set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('만료된 토큰 → 401', async () => {
    const token = jwt.sign({ userId: 'uuid-123', email: 'a@b.com' }, secret, { algorithm: 'HS256', expiresIn: -1 });
    const res = await request(makeApp()).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});
