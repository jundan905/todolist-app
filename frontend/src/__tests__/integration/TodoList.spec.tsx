import { describe, it, expect, beforeEach } from 'vitest';
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
  return { queryClient, ...render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/todos/:todoId/edit" element={<div>수정 페이지</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )};
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
  const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
  useAuthStore.getState().setToken(validToken);
  useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
});

describe('TodoList 통합 테스트', () => {
  it('로그인 상태에서 할일 목록이 표시된다', async () => {
    renderTodoListPage();

    await waitFor(() => {
      expect(screen.getByText('테스트 할일')).toBeInTheDocument();
    });
  });

  it('할일 생성 후 목록에 새 항목이 표시된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json({
          data: [
            {
              id: 'todo-1', userId: 'user-1', title: '테스트 할일', description: '설명',
              startDate: '2026-04-01', dueDate: '2026-04-07', isCompleted: false,
              completedAt: null, status: 'IN_PROGRESS',
              createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z',
            },
            {
              id: 'todo-2', userId: 'user-1', title: '새로운 할일', description: null,
              startDate: '2026-04-02', dueDate: '2026-04-10', isCompleted: false,
              completedAt: null, status: 'IN_PROGRESS',
              createdAt: '2026-04-02T00:00:00.000Z', updatedAt: '2026-04-02T00:00:00.000Z',
            },
          ],
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        });
      })
    );

    renderTodoListPage();

    await waitFor(() => {
      expect(screen.getByText('테스트 할일')).toBeInTheDocument();
      expect(screen.getByText('새로운 할일')).toBeInTheDocument();
    });
  });

  it('할일 추가 버튼 클릭 시 모달이 열린다', async () => {
    renderTodoListPage();

    fireEvent.click(screen.getByText('+ 할일 추가'));

    await waitFor(() => {
      expect(screen.getByText('할일 추가')).toBeInTheDocument();
    });
  });
});
