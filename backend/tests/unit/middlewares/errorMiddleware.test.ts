import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../../../src/middlewares/errorMiddleware';
import { AppError } from '../../../src/errors/AppError';

const makeApp = (handler: (req: Request, res: Response, next: NextFunction) => void) => {
  const app = express();
  app.use(express.json());
  app.get('/test', handler);
  app.use(errorMiddleware);
  return app;
};

describe('errorMiddleware', () => {
  it('AppError → { error: { code, message } }', async () => {
    const app = makeApp((_req, _res, next) => {
      next(new AppError('잘못된 요청', 400, 'BAD_REQUEST'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: 'BAD_REQUEST', message: '잘못된 요청' } });
  });

  it('일반 Error → 500 INTERNAL_SERVER_ERROR', async () => {
    const app = makeApp((_req, _res, next) => {
      next(new Error('알 수 없는 오류'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
