process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = 'test-secret-for-unit-test';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/utils/passwordUtils');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
  verify: jest.fn(() => ({ userId: 'user-123', email: 'test@example.com' })),
}));

import request from 'supertest';
import app from '../../../src/app';
import * as userRepository from '../../../src/repositories/userRepository';
import * as passwordUtils from '../../../src/utils/passwordUtils';
import jwt from 'jsonwebtoken';
import { pool } from '../../../src/config/database';

const mockFindByEmail = userRepository.findByEmail as jest.MockedFunction<typeof userRepository.findByEmail>;
const mockInsertUser = userRepository.insertUser as jest.MockedFunction<typeof userRepository.insertUser>;
const mockHashPassword = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;
const mockComparePassword = passwordUtils.comparePassword as jest.MockedFunction<typeof passwordUtils.comparePassword>;
const mockJwtVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;

const VALID_PASSWORD = 'Test@1234';
const mockUserRow = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  password: 'hashed-password',
  name: '테스트유저',
  created_at: new Date('2024-01-01T00:00:00Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BE-06: Auth Controller + Routes (UC-01, UC-02, UC-03)', () => {
  describe('POST /api/auth/signup (UC-01)', () => {
    it('성공: 유효한 정보로 회원가입하면 201 응답 (AC-01-1)', async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockInsertUser.mockResolvedValue(mockUserRow);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: VALID_PASSWORD,
          name: '테스트유저',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', mockUserRow.id);
      expect(res.body).toHaveProperty('email', mockUserRow.email);
      expect(res.body).toHaveProperty('name', mockUserRow.name);
      expect(res.body).toHaveProperty('message', '회원가입 성공');
    });

    it('실패: 중복 이메일이면 409 응답 (AC-01-2)', async () => {
      mockFindByEmail.mockResolvedValue(mockUserRow);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: VALID_PASSWORD,
          name: '테스트유저',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty('code', 'EMAIL_DUPLICATE');
    });

    it('실패: 필수값 누락 시 400 응답 (AC-01-3)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: VALID_PASSWORD,
          // name 누락
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'MISSING_FIELDS');
    });

    it('실패: 비밀번호 복잡도 미충족 시 400 응답', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: '테스트',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PASSWORD');
    });
  });

  describe('POST /api/auth/login (UC-02)', () => {
    it('성공: 유효한 자격증명으로 로그인하면 200 응답 + JWT (AC-02-1)', async () => {
      mockFindByEmail.mockResolvedValue(mockUserRow);
      mockComparePassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: VALID_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken', 'fake-jwt-token');
      expect(res.body).toHaveProperty('expiresIn', 3600);
      expect(res.body.user).toHaveProperty('email', mockUserRow.email);
    });

    it('실패: 존재하지 않는 이메일로 로그인 시 401 응답 (AC-02-3)', async () => {
      mockFindByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: VALID_PASSWORD,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('실패: 비밀번호 불일치 시 401 응답 (AC-02-2)', async () => {
      mockFindByEmail.mockResolvedValue(mockUserRow);
      mockComparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPass@1',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('실패: 필수값 누락 시 400 응답', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // password 누락
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'MISSING_FIELDS');
    });
  });

  describe('POST /api/auth/logout (UC-03)', () => {
    it('성공: 인증된 사용자가 로그아웃하면 200 응답', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('로그아웃 성공');
    });

    it('실패: 토큰 없이 로그아웃하면 401 응답', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send();

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('실패: 유효하지 않은 토큰으로 로그아웃하면 401 응답', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('message', '유효하지 않은 토큰입니다.');
    });
  });
});
