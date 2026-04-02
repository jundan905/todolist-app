process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Express 앱의 기본 동작 테스트
import request from 'supertest';
import app from '../../src/app';

describe('App 기본 설정', () => {
  it('GET /health → 200 { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('존재하지 않는 경로 → 404', async () => {
    const res = await request(app).get('/not-exist');
    expect(res.status).toBe(404);
  });
});

describe('AppError 에러 핸들러', () => {
  it('AppError를 JSON 응답으로 변환', async () => {
    const { AppError } = await import('../../src/errors/AppError');
    const testApp = require('express')();
    testApp.use(require('express').json());
    testApp.get('/test-error', () => { throw new AppError('테스트 오류', 400, 'TEST_ERROR'); });
    testApp.use((err: Error, _req: any, res: any, _next: any) => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    });
    const res = await request(testApp).get('/test-error');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('테스트 오류');
  });
});
