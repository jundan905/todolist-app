import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoDetailPage from '../../pages/TodoDetailPage';
import { useAuthStore } from '../../stores/useAuthStore';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('TodoDetailPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setToken(validToken);
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
  });

  it('할일 상세 정보가 표시된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => {
        return HttpResponse.json({
          id: 'todo-1',
          userId: 'user-1',
          title: '테스트 할일',
          description: '테스트 설명입니다',
          startDate: '2026-04-01',
          dueDate: '2026-04-10',
          isCompleted: false,
          completedAt: null,
          status: 'IN_PROGRESS',
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        });
      })
    );

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/todos/todo-1']}>
          <Routes>
            <Route path="/todos/:todoId" element={<TodoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('테스트 할일')).toBeInTheDocument();
    });
    expect(screen.getByText('테스트 설명입니다')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
  });

  it('로딩 중에는 스피너가 표시된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          id: 'todo-1',
          userId: 'user-1',
          title: '테스트 할일',
          description: '테스트 설명',
          startDate: '2026-04-01',
          dueDate: '2026-04-10',
          isCompleted: false,
          completedAt: null,
          status: 'IN_PROGRESS',
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        });
      })
    );

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/todos/todo-1']}>
          <Routes>
            <Route path="/todos/:todoId" element={<TodoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('403 에러 시 접근 권한 없음 메시지가 표시된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => {
        return new HttpResponse(null, { status: 403 });
      })
    );

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/todos/other-todo']}>
          <Routes>
            <Route path="/todos/:todoId" element={<TodoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('접근 권한이 없습니다.')).toBeInTheDocument();
    });
  });

  it('404 에러 시 할일을 찾을 수 없다는 메시지가 표시된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/todos/nonexistent']}>
          <Routes>
            <Route path="/todos/:todoId" element={<TodoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('요청한 항목을 찾을 수 없습니다.')).toBeInTheDocument();
    });
  });
});
