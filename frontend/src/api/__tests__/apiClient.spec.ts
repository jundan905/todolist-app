import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../stores/useAuthStore';
import { signup, login, logout } from '../authApi';
import { getTodos, getTodo, createTodo, updateTodo, toggleComplete } from '../todoApi';

// axiosInstance 를 모킹하기 전에 모의 설정
vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: {
      baseURL: 'http://localhost:3000',
      headers: {},
      timeout: 10000,
    },
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    create: vi.fn().mockReturnThis(),
  };
  return {
    default: mockAxiosInstance,
    __esModule: true,
    mockAxiosInstance,
  };
});

import axios from 'axios';

const mockAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  mockAxiosInstance: typeof axios;
};

describe('API Client Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  describe('authApi', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: '테스터',
      createdAt: '2026-04-01T00:00:00.000Z',
    };

    describe('signup', () => {
      it('회원가입 성공 - 201 응답', async () => {
        const mockSignupInput = {
          email: 'test@example.com',
          password: 'Password1!',
          name: '테스터',
        };

        const mockResponse = {
          data: {
            id: 'user-1',
            email: mockSignupInput.email,
            name: mockSignupInput.name,
            createdAt: mockUser.createdAt,
            message: '회원가입 성공',
          },
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await signup(mockSignupInput);

        expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/signup', mockSignupInput);
        expect(result).toEqual(mockResponse.data);
      });

      it('중복 이메일 - 409 응답', async () => {
        const mockSignupInput = {
          email: 'existing@example.com',
          password: 'Password1!',
          name: '테스터',
        };

        const mockError = {
          response: {
            status: 409,
            data: { error: { code: 'DUPLICATE_EMAIL', message: '이미 가입된 이메일입니다' } },
          },
        };

        mockAxios.post.mockRejectedValueOnce(mockError);

        await expect(signup(mockSignupInput)).rejects.toEqual(mockError);
      });

      it('유효성 검사 오류 - 400 응답', async () => {
        const invalidInput = {
          email: 'invalid-email',
          password: 'weak',
          name: '',
        };

        const mockError = {
          response: {
            status: 400,
            data: { error: { code: 'VALIDATION_ERROR', message: '유효성 검사 실패' } },
          },
        };

        mockAxios.post.mockRejectedValueOnce(mockError);

        await expect(signup(invalidInput)).rejects.toEqual(mockError);
      });
    });

    describe('login', () => {
      it('로그인 성공 - 200 응답 + JWT 토큰', async () => {
        const mockLoginInput = {
          email: 'test@example.com',
          password: 'Password1!',
        };

        const mockResponse = {
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 3600,
            user: mockUser,
          },
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await login(mockLoginInput);

        expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', mockLoginInput);
        expect(result).toEqual(mockResponse.data);
      });

      it('비밀번호 불일치 - 401 응답', async () => {
        const mockLoginInput = {
          email: 'test@example.com',
          password: 'WrongPassword1!',
        };

        const mockError = {
          response: {
            status: 401,
            data: { error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다' } },
          },
        };

        mockAxios.post.mockRejectedValueOnce(mockError);

        await expect(login(mockLoginInput)).rejects.toEqual(mockError);
      });

      it('이메일 미존재 - 401 응답', async () => {
        const mockLoginInput = {
          email: 'nonexistent@example.com',
          password: 'Password1!',
        };

        const mockError = {
          response: {
            status: 401,
            data: { error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다' } },
          },
        };

        mockAxios.post.mockRejectedValueOnce(mockError);

        await expect(login(mockLoginInput)).rejects.toEqual(mockError);
      });
    });

    describe('logout', () => {
      it('로그아웃 성공 - 200 응답', async () => {
        const mockResponse = { data: { message: '로그아웃 성공' } };
        mockAxios.post.mockResolvedValueOnce(mockResponse);

        await logout();

        expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/logout');
      });
    });
  });

  describe('todoApi', () => {
    const mockTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '테스트 할일',
      description: '테스트 설명',
      startDate: '2026-04-01',
      dueDate: '2026-04-10',
      isCompleted: false,
      completedAt: null,
      status: 'IN_PROGRESS' as const,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    };

    beforeEach(() => {
      useAuthStore.getState().setToken('test-token');
    });

    describe('getTodos', () => {
      it('할일 목록 조회 성공 - 페이지네이션 포함', async () => {
        const mockResponse = {
          data: {
            data: [mockTodo],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await getTodos({ page: 1, limit: 20 });

        expect(mockAxios.get).toHaveBeenCalledWith('/api/todos', {
          params: { page: 1, limit: 20 },
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('상태 필터로 조회', async () => {
        const mockResponse = {
          data: {
            data: [mockTodo],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        await getTodos({ status: 'IN_PROGRESS', sortBy: 'dueDate', sortOrder: 'asc' });

        expect(mockAxios.get).toHaveBeenCalledWith('/api/todos', {
          params: { status: 'IN_PROGRESS', sortBy: 'dueDate', sortOrder: 'asc' },
        });
      });

      it('필터 없이 전체 조회', async () => {
        const mockResponse = {
          data: {
            data: [mockTodo],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        await getTodos();

        expect(mockAxios.get).toHaveBeenCalledWith('/api/todos', { params: undefined });
      });
    });

    describe('getTodo', () => {
      it('할일 상세 조회 성공', async () => {
        const mockResponse = { data: mockTodo };
        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await getTodo('todo-1');

        expect(mockAxios.get).toHaveBeenCalledWith('/api/todos/todo-1');
        expect(result).toEqual(mockTodo);
      });

      it('존재하지 않는 할일 - 404 응답', async () => {
        const mockError = {
          response: {
            status: 404,
            data: { error: { code: 'NOT_FOUND', message: '할일을 찾을 수 없습니다' } },
          },
        };

        mockAxios.get.mockRejectedValueOnce(mockError);

        await expect(getTodo('nonexistent')).rejects.toEqual(mockError);
      });
    });

    describe('createTodo', () => {
      it('할일 생성 성공 - 201 응답', async () => {
        const mockInput = {
          title: '새 할일',
          description: '새 할일 설명',
          startDate: '2026-04-05',
          dueDate: '2026-04-15',
        };

        const mockResponse = {
          data: {
            ...mockTodo,
            ...mockInput,
            id: 'todo-new',
          },
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await createTodo(mockInput);

        expect(mockAxios.post).toHaveBeenCalledWith('/api/todos', mockInput);
        expect(result).toEqual(mockResponse.data);
      });

      it('종료일 < 시작일 - 400 응답', async () => {
        const invalidInput = {
          title: '잘못된 할일',
          startDate: '2026-04-10',
          dueDate: '2026-04-01',
        };

        const mockError = {
          response: {
            status: 400,
            data: { error: { code: 'INVALID_DATES', message: '종료일은 시작일 이상이어야 합니다' } },
          },
        };

        mockAxios.post.mockRejectedValueOnce(mockError);

        await expect(createTodo(invalidInput)).rejects.toEqual(mockError);
      });

      it('제목 누락 - 400 응답', async () => {
        const invalidInput = {
          title: '',
          startDate: '2026-04-01',
          dueDate: '2026-04-10',
        };

        const mockError = {
          response: {
            status: 400,
            data: { error: { code: 'VALIDATION_ERROR', message: '제목은 필수입니다' } },
          },
        };

        mockAxios.post.mockRejectedValueOnce(mockError);

        await expect(createTodo(invalidInput)).rejects.toEqual(mockError);
      });
    });

    describe('updateTodo', () => {
      it('할일 수정 성공', async () => {
        const mockInput = {
          title: '수정된 제목',
          description: '수정된 설명',
        };

        const mockResponse = {
          data: {
            ...mockTodo,
            ...mockInput,
            updatedAt: '2026-04-02T00:00:00.000Z',
          },
        };

        mockAxios.patch.mockResolvedValueOnce(mockResponse);

        const result = await updateTodo('todo-1', mockInput);

        expect(mockAxios.patch).toHaveBeenCalledWith('/api/todos/todo-1', mockInput);
        expect(result).toEqual(mockResponse.data);
      });

      it('존재하지 않는 할일 수정 - 404 응답', async () => {
        const mockInput = { title: '수정' };
        const mockError = {
          response: { status: 404, data: { error: { code: 'NOT_FOUND' } } },
        };

        mockAxios.patch.mockRejectedValueOnce(mockError);

        await expect(updateTodo('nonexistent', mockInput)).rejects.toEqual(mockError);
      });
    });

    describe('toggleComplete', () => {
      it('할일 완료 처리 성공 (isCompleted=true)', async () => {
        const mockResponse = {
          data: {
            ...mockTodo,
            isCompleted: true,
            completedAt: '2026-04-02T12:00:00.000Z',
            status: 'COMPLETED',
          },
        };

        mockAxios.patch.mockResolvedValueOnce(mockResponse);

        const result = await toggleComplete('todo-1', true);

        expect(mockAxios.patch).toHaveBeenCalledWith('/api/todos/todo-1/complete', {
          isCompleted: true,
        });
        expect(result.isCompleted).toBe(true);
        expect(result.status).toBe('COMPLETED');
      });

      it('할일 완료 취소 성공 (isCompleted=false)', async () => {
        const completedTodo = {
          ...mockTodo,
          isCompleted: true,
          completedAt: '2026-04-02T12:00:00.000Z',
          status: 'COMPLETED',
        };

        const mockResponse = {
          data: {
            ...completedTodo,
            isCompleted: false,
            completedAt: null,
            status: 'IN_PROGRESS',
          },
        };

        mockAxios.patch.mockResolvedValueOnce(mockResponse);

        const result = await toggleComplete('todo-1', false);

        expect(mockAxios.patch).toHaveBeenCalledWith('/api/todos/todo-1/complete', {
          isCompleted: false,
        });
        expect(result.isCompleted).toBe(false);
        expect(result.completedAt).toBeNull();
      });
    });
  });
});
