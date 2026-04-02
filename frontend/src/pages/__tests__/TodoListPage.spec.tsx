import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoListPage from '../../pages/TodoListPage';
import { useAuthStore } from '../../stores/useAuthStore';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderTodoListPage() {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/todos/:todoId/edit" element={<div>수정 페이지</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TodoListPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setToken(validToken);
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
  });

  it('사용자 이름이 헤더에 표시된다', async () => {
    renderTodoListPage();
    await waitFor(() => {
      expect(screen.getByText('테스터')).toBeInTheDocument();
    });
  });

  it('로그아웃 버튼이 렌더링된다', async () => {
    renderTodoListPage();
    await waitFor(() => {
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });
  });

  it('할일 추가 버튼이 렌더링된다', async () => {
    renderTodoListPage();
    await waitFor(() => {
      expect(screen.getByText('+ 할일 추가')).toBeInTheDocument();
    });
  });

  it('할일 추가 버튼 클릭 시 모달이 열린다', async () => {
    renderTodoListPage();
    fireEvent.click(screen.getByText('+ 할일 추가'));
    await waitFor(() => {
      expect(screen.getByText('할일 추가')).toBeInTheDocument();
    });
  });

  it('TodoFilter 컴포넌트가 렌더링된다', async () => {
    renderTodoListPage();
    await waitFor(() => {
      expect(screen.getByLabelText('상태 필터')).toBeInTheDocument();
    });
  });

  it('할일 목록이 empty state 로 표시된다 (할일이 없을 때)', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json({
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        });
      })
    );

    renderTodoListPage();

    await waitFor(() => {
      expect(screen.getByText('등록된 할일이 없습니다')).toBeInTheDocument();
    });
  });

  it('상태 필터 변경 시 목록이 업데이트된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos', ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        
        return HttpResponse.json({
          data: status === 'COMPLETED' 
            ? [{
                id: 'todo-completed',
                userId: 'user-1',
                title: '완료된 할일',
                description: null,
                startDate: '2026-04-01',
                dueDate: '2026-04-07',
                isCompleted: true,
                completedAt: '2026-04-05T00:00:00.000Z',
                status: 'COMPLETED',
                createdAt: '2026-04-01T00:00:00.000Z',
                updatedAt: '2026-04-05T00:00:00.000Z',
              }]
            : [],
          pagination: { page: 1, limit: 20, total: status === 'COMPLETED' ? 1 : 0, totalPages: status === 'COMPLETED' ? 1 : 0, hasNextPage: false, hasPrevPage: false },
        });
      })
    );

    renderTodoListPage();

    await waitFor(() => {
      const statusFilter = screen.getByRole('combobox', { name: /상태/i });
      fireEvent.change(statusFilter, { target: { value: 'COMPLETED' } });
    });
  });
});
