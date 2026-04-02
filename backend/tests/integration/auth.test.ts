process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todolist_test';
process.env.JWT_SECRET = 'test-secret-for-integration';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../src/app';
import { pool } from '../../src/config/database';
import { AppError } from '../../src/errors/AppError';

describe('Auth Integration Tests (UC-01, UC-02)', () => {
  const testUserData = {
    email: 'integration-test@example.com',
    password: 'Test@1234',
    name: '통합테스트유저',
  };

  beforeEach(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUserData.email]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUserData.email]);
    await pool.end();
  });

  describe('POST /api/auth/signup (UC-01)', () => {
    it('성공: 유효한 정보로 회원가입하면 201 과 사용자 정보를 반환한다 (AC-01-1)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', testUserData.email);
      expect(res.body).toHaveProperty('name', testUserData.name);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body.message).toBe('회원가입 성공');
    });

    it('실패: 중복 이메일이면 409 를 반환한다 (AC-01-2, BR-10)', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: '다른이름',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty('code', 'EMAIL_DUPLICATE');
    });

    it('실패: 필수값 누락 시 400 을 반환한다 (AC-01-3)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'MISSING_FIELDS');
    });

    it('실패: 비밀번호 복잡도 미충족 시 400 을 반환한다 (BR-11)', async () => {
      const weakPassword = 'weak';
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'weak-test@example.com',
          password: weakPassword,
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('실패: 비밀번호 8 자 미만이면 400 을 반환한다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'short-pw@example.com',
          password: 'Aa1!',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('실패: 비밀번호에 대문자가 없으면 400 을 반환한다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'no-upper@example.com',
          password: 'test@1234',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('실패: 비밀번호에 소문자가 없으면 400 을 반환한다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'no-lower@example.com',
          password: 'TEST@1234',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('실패: 비밀번호에 숫자가 없으면 400 을 반환한다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'no-digit@example.com',
          password: 'Test@abcd',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('실패: 비밀번호에 특수문자가 없으면 400 을 반환한다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'no-special@example.com',
          password: 'Test1234',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('성공: 비밀번호가 정확히 8 자이면 허용된다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'min-length@example.com',
          password: 'Test@123',
          name: '테스트',
        });

      expect(res.status).toBe(201);
    });

    it('성공: 비밀번호가 정확히 20 자이면 허용된다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'max-length@example.com',
          password: 'Test@1234Test@1234',
          name: '테스트',
        });

      expect(res.status).toBe(201);
    });

    it('실패: 비밀번호가 20 자 초과이면 400 을 반환한다 (BR-11)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'too-long@example.com',
          password: 'Test@1234Test@12345',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });
  });

  describe('POST /api/auth/login (UC-02)', () => {
    const loginUserData = {
      email: 'login-test@example.com',
      password: 'Test@1234',
      name: '로그인테스트유저',
    };

    beforeEach(async () => {
      await pool.query('DELETE FROM users WHERE email = $1', [loginUserData.email]);
      await request(app)
        .post('/api/auth/signup')
        .send(loginUserData);
    });

    afterAll(async () => {
      await pool.query('DELETE FROM users WHERE email = $1', [loginUserData.email]);
    });

    it('성공: 유효한 자격증명으로 로그인하면 200 과 JWT 토큰을 반환한다 (AC-02-1)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserData.email,
          password: loginUserData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body).toHaveProperty('expiresIn', 3600);
      expect(res.body.user).toHaveProperty('email', loginUserData.email);
      expect(res.body.user).toHaveProperty('name', loginUserData.name);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('createdAt');
    });

    it('실패: 존재하지 않는 이메일로 로그인 시 401 을 반환한다 (AC-02-3)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: loginUserData.password,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('실패: 비밀번호가 일치하지 않으면 401 을 반환한다 (AC-02-2)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserData.email,
          password: 'WrongPass@1',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('실패: 필수값 누락 시 400 을 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserData.email,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'MISSING_FIELDS');
    });

    it('성공: 로그인 응답의 user 객체에 비밀번호는 포함되지 않는다', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserData.email,
          password: loginUserData.password,
        });

      expect(res.body.user).not.toHaveProperty('password');
    });
  });

  describe('POST /api/auth/logout (UC-03)', () => {
    let accessToken: string;

    beforeEach(async () => {
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'logout-test@example.com',
          password: 'Test@1234',
          name: '로그아웃테스트유저',
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout-test@example.com',
          password: 'Test@1234',
        });

      accessToken = loginRes.body.accessToken;
    });

    afterAll(async () => {
      await pool.query('DELETE FROM users WHERE email = $1', ['logout-test@example.com']);
    });

    it('성공: 유효한 토큰으로 로그아웃하면 200 을 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('로그아웃 성공');
    });

    it('실패: 토큰 없이 로그아웃하면 401 을 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send();

      expect(res.status).toBe(401);
    });

    it('실패: 유효하지 않은 토큰으로 로그아웃하면 401 을 반환한다', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
