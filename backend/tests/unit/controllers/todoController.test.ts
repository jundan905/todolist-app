process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = 'test-secret-for-unit-test';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/repositories/todoRepository');
jest.mock('../../../src/utils/passwordUtils');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
  verify: jest.fn(() => ({ userId: 'user-123', email: 'test@example.com' })),
}));

import request from 'supertest';
import app from '../../../src/app';
import * as todoRepository from '../../../src/repositories/todoRepository';
import * as userRepository from '../../../src/repositories/userRepository';
import * as passwordUtils from '../../../src/utils/passwordUtils';

const mockTodoRepository = {
  insertTodo: jest.spyOn(todoRepository, 'insertTodo'),
  findById: jest.spyOn(todoRepository, 'findById'),
  findByIdAndUserId: jest.spyOn(todoRepository, 'findByIdAndUserId'),
  findByUserId: jest.spyOn(todoRepository, 'findByUserId'),
  updateTodo: jest.spyOn(todoRepository, 'updateTodo'),
  updateTodoStatus: jest.spyOn(todoRepository, 'updateTodoStatus'),
  countByUserId: jest.spyOn(todoRepository, 'countByUserId'),
};

const mockFindByEmail = userRepository.findByEmail as jest.MockedFunction<typeof userRepository.findByEmail>;
const mockHashPassword = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;
const mockInsertUser = userRepository.insertUser as jest.MockedFunction<typeof userRepository.insertUser>;

const mockUserRow = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  password: 'hashed-password',
  name: '테스트유저',
  created_at: new Date('2024-01-01T00:00:00Z'),
};

const mockTodoRow = {
  id: 'todo-uuid-1',
  userId: 'user-uuid-1',
  title: '테스트 할일',
  description: '테스트 설명',
  startDate: '2026-04-01',
  dueDate: '2026-04-07',
  isCompleted: false,
  completedAt: null,
  createdAt: new Date('2026-04-01T00:00:00Z'),
  updatedAt: new Date('2026-04-01T00:00:00Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFindByEmail.mockResolvedValue(mockUserRow);
  mockHashPassword.mockResolvedValue('hashed-password');
  mockInsertUser.mockResolvedValue(mockUserRow);
});

describe('BE-07,08,09: Todo Controller + Routes (UC-04~08)', () => {
  const getAuthToken = async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'Test@1234', name: '테스트' });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test@1234' });
    
    return loginRes.body.accessToken;
  };

  describe('POST /api/todos (UC-04)', () => {
    it('성공: 할일 생성하면 201 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.insertTodo.mockResolvedValue(mockTodoRow);

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '테스트 할일',
          description: '테스트 설명',
          startDate: '2026-04-01',
          dueDate: '2026-04-07',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', mockTodoRow.id);
      expect(res.body).toHaveProperty('title', mockTodoRow.title);
    });

    it('실패: 필수값 누락 시 400 응답', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '테스트 할일',
          // startDate, dueDate 누락
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'MISSING_FIELDS');
    });

    it('실패: dueDate < startDate 이면 400 응답', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '테스트 할일',
          startDate: '2026-04-07',
          dueDate: '2026-04-01',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_DATE_RANGE');
    });

    it('실패: 미인증 요청 시 401 응답', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({
          title: '테스트 할일',
          startDate: '2026-04-01',
          dueDate: '2026-04-07',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/todos (UC-05)', () => {
    it('성공: 할일 목록 조회하면 200 응답 + pagination', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByUserId.mockResolvedValue([mockTodoRow]);
      mockTodoRepository.countByUserId.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page', 1);
      expect(res.body.pagination).toHaveProperty('limit', 20);
    });

    it('실패: page < 1 이면 400 응답', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .get('/api/todos?page=0')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_PAGE');
    });

    it('실패: limit < 1 또는 limit > 100 이면 400 응답', async () => {
      const token = await getAuthToken();

      const res1 = await request(app)
        .get('/api/todos?limit=0')
        .set('Authorization', `Bearer ${token}`);

      expect(res1.status).toBe(400);
      expect(res1.body.error).toHaveProperty('code', 'INVALID_LIMIT');

      const res2 = await request(app)
        .get('/api/todos?limit=101')
        .set('Authorization', `Bearer ${token}`);

      expect(res2.status).toBe(400);
      expect(res2.body.error).toHaveProperty('code', 'INVALID_LIMIT');
    });

    it('실패: 미인증 요청 시 401 응답', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/todos/:todoId (UC-06)', () => {
    it('성공: 할일 상세 조회하면 200 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(mockTodoRow);

      const res = await request(app)
        .get('/api/todos/todo-uuid-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', mockTodoRow.id);
    });

    it('실패: 할일이 없으면 404 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(null);
      mockTodoRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/todos/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toHaveProperty('code', 'TODO_NOT_FOUND');
    });

    it('실패: 타인 할일 접근 시 403 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(null);
      mockTodoRepository.findById.mockResolvedValue({ ...mockTodoRow, userId: 'other-user' });

      const res = await request(app)
        .get('/api/todos/todo-uuid-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty('code', 'FORBIDDEN');
    });
  });

  describe('PATCH /api/todos/:todoId (UC-07)', () => {
    it('성공: 할일 수정하면 200 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(mockTodoRow);
      mockTodoRepository.updateTodo.mockResolvedValue({
        ...mockTodoRow,
        title: '수정된 할일',
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch('/api/todos/todo-uuid-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '수정된 할일' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('수정된 할일');
    });

    it('실패: 수정할 필드가 없으면 400 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(mockTodoRow);

      const res = await request(app)
        .patch('/api/todos/todo-uuid-1')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'NO_FIELDS');
    });

    it('실패: dueDate < startDate 이면 400 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(mockTodoRow);

      const res = await request(app)
        .patch('/api/todos/todo-uuid-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ startDate: '2026-04-07', dueDate: '2026-04-01' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_DATE_RANGE');
    });
  });

  describe('PATCH /api/todos/:todoId/complete (UC-08)', () => {
    it('성공: 할일 완료 처리하면 200 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(mockTodoRow);
      mockTodoRepository.updateTodoStatus.mockResolvedValue({
        ...mockTodoRow,
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch('/api/todos/todo-uuid-1/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ isCompleted: true });

      expect(res.status).toBe(200);
      expect(res.body.isCompleted).toBe(true);
    });

    it('실패: isCompleted 가 boolean 이 아니면 400 응답', async () => {
      const token = await getAuthToken();
      mockTodoRepository.findByIdAndUserId.mockResolvedValue(mockTodoRow);

      const res = await request(app)
        .patch('/api/todos/todo-uuid-1/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ isCompleted: 'true' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_FIELD');
    });

    it('실패: 미인증 요청 시 401 응답', async () => {
      const res = await request(app)
        .patch('/api/todos/todo-uuid-1/complete')
        .send({ isCompleted: true });

      expect(res.status).toBe(401);
    });
  });
});
