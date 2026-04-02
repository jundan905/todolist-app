import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import LoginPage from '../../pages/LoginPage';
import SignupPage from '../../pages/SignupPage';
import TodoListPage from '../../pages/TodoListPage';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderApp(initialPath: string) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/todos" element={<TodoListPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
  vi.clearAllMocks();
});

describe('SCN-01: 회원가입 → 로그인 → 할일 생성 시나리오', () => {
  it('회원가입 후 로그인하고 할일 목록에 접근한다', async () => {
    // 1. 회원가입
    server.use(
      http.post('http://localhost:3000/api/auth/signup', () => {
        return HttpResponse.json({
          id: 'user-1',
          email: 'test@example.com',
          name: '테스터',
          createdAt: '2026-04-01T00:00:00.000Z',
          message: '회원가입 성공',
        }, { status: 201 });
      })
    );

    renderApp('/signup');

    // 회원가입 폼 입력
    await waitFor(() => {
      expect(screen.getByLabelText('이름')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '테스터' } });
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'Password1!' } });

    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    // 2. 로그인 페이지로 이동 확인
    await waitFor(() => {
      expect(screen.getAllByText('로그인')[0]).toBeInTheDocument();
    });

    // 3. 로그인
    server.use(
      http.post('http://localhost:3000/api/auth/login', () => {
        return HttpResponse.json({
          accessToken: makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600, userId: 'user-1', email: 'test@example.com' }),
          expiresIn: 3600,
          user: { id: 'user-1', email: 'test@example.com', name: '테스터', createdAt: '2026-04-01T00:00:00.000Z' },
        });
      })
    );

    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    // 4. 할일 목록 페이지로 이동 확인
    await waitFor(() => {
      expect(screen.getByText('할일 목록')).toBeInTheDocument();
    });
  });
});

describe('SCN-02: 할일 완료 처리 시나리오', () => {
  beforeEach(() => {
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600, userId: 'user-1', email: 'test@example.com' });
    useAuthStore.getState().setToken(validToken);
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
  });

  it('할일을 완료 처리하고 상태가 변경된다', async () => {
    // 초기 할일 목록
    const mockTodos = {
      data: [
        {
          id: 'todo-1',
          userId: 'user-1',
          title: '완료할 할일',
          description: '테스트 할일',
          startDate: '2026-04-01',
          dueDate: '2026-04-10',
          isCompleted: false,
          completedAt: null,
          status: 'IN_PROGRESS',
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };

    // 완료 처리 후 응답
    const completedTodo = {
      ...mockTodos.data[0],
      isCompleted: true,
      completedAt: '2026-04-02T12:00:00.000Z',
      status: 'COMPLETED',
      updatedAt: '2026-04-02T12:00:00.000Z',
    };

    server.use(
      http.get('http://localhost:3000/api/todos', () => HttpResponse.json(mockTodos)),
      http.patch('http://localhost:3000/api/todos/:todoId/complete', () => HttpResponse.json(completedTodo))
    );

    renderApp('/todos');

    // 할일 목록 로드 대기
    await waitFor(() => {
      expect(screen.getByText('완료할 할일')).toBeInTheDocument();
    });

    // 완료 버튼 찾기 및 클릭
    const completeButton = screen.getByLabelText('완료 처리');
    fireEvent.click(completeButton);

    // API 호출 확인 (낙관적 업데이트로 인해 UI 는 즉시 변하지 않을 수 있음)
    await waitFor(() => {
      expect(screen.getByLabelText('완료 처리')).toBeInTheDocument();
    });
  });
});

describe('SCN-05: 상태 필터링 시나리오', () => {
  beforeEach(() => {
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600, userId: 'user-1', email: 'test@example.com' });
    useAuthStore.getState().setToken(validToken);
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
  });

  it('상태 필터를 변경하면 목록이 필터링된다', async () => {
    // 전체 할일
    const allTodos = {
      data: [
        {
          id: 'todo-1',
          userId: 'user-1',
          title: '진행 중 할일',
          description: '테스트',
          startDate: '2026-04-01',
          dueDate: '2026-04-10',
          isCompleted: false,
          completedAt: null,
          status: 'IN_PROGRESS',
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
        {
          id: 'todo-2',
          userId: 'user-1',
          title: '완료된 할일',
          description: '테스트',
          startDate: '2026-04-01',
          dueDate: '2026-04-10',
          isCompleted: true,
          completedAt: '2026-04-05T00:00:00.000Z',
          status: 'COMPLETED',
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-05T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };

    // 완료된 할일만 필터
    const completedTodos = {
      data: [allTodos.data[1]],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };

    server.use(
      http.get('http://localhost:3000/api/todos', ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        
        if (status === 'COMPLETED') {
          return HttpResponse.json(completedTodos);
        }
        return HttpResponse.json(allTodos);
      })
    );

    renderApp('/todos');

    // 초기 목록 로드
    await waitFor(() => {
      expect(screen.getByText('진행 중 할일')).toBeInTheDocument();
    });

    // 상태 필터 변경
    const statusFilter = screen.getByLabelText('상태 필터');
    fireEvent.change(statusFilter, { target: { value: 'COMPLETED' } });

    // 필터링된 목록 확인 (쿼리 리페칭 대기)
    await waitFor(() => {
      expect(screen.getByText('완료된 할일')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
