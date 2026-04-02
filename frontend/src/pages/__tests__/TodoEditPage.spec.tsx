import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoEditPage from '../../pages/TodoEditPage';
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

describe('TodoEditPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setToken(validToken);
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
  });

  it('할일 수정 폼이 기존 값으로 렌더링된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => {
        return HttpResponse.json({
          id: 'todo-1',
          userId: 'user-1',
          title: '기존 제목',
          description: '기존 설명',
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
        <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
          <Routes>
            <Route path="/todos/:todoId/edit" element={<TodoEditPage />} />
            <Route path="/todos/:todoId" element={<div>상세 페이지</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('할일 수정')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('제목 *') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('설명') as HTMLInputElement;

    expect(titleInput.value).toBe('기존 제목');
    expect(descriptionInput.value).toBe('기존 설명');
  });

  it('수정 후 저장 버튼 클릭 시 상세 페이지로 이동한다', async () => {
    const mockTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '기존 제목',
      description: '기존 설명',
      startDate: '2026-04-01',
      dueDate: '2026-04-10',
      isCompleted: false,
      completedAt: null,
      status: 'IN_PROGRESS',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    };

    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => HttpResponse.json(mockTodo)),
      http.patch('http://localhost:3000/api/todos/:todoId', () => {
        return HttpResponse.json({
          ...mockTodo,
          title: '수정된 제목',
          updatedAt: '2026-04-02T00:00:00.000Z',
        });
      })
    );

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
          <Routes>
            <Route path="/todos/:todoId/edit" element={<TodoEditPage />} />
            <Route path="/todos/:todoId" element={<div>상세 페이지</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('할일 수정')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /저장/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('상세 페이지')).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 상세 페이지로 이동한다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => {
        return HttpResponse.json({
          id: 'todo-1',
          userId: 'user-1',
          title: '기존 제목',
          description: '기존 설명',
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
        <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
          <Routes>
            <Route path="/todos/:todoId/edit" element={<TodoEditPage />} />
            <Route path="/todos/:todoId" element={<div>상세 페이지</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('할일 수정')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /취소/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('상세 페이지')).toBeInTheDocument();
    });
  });

  it('종료일 < 시작일 시 에러가 표시된다', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos/:todoId', () => {
        return HttpResponse.json({
          id: 'todo-1',
          userId: 'user-1',
          title: '기존 제목',
          description: '기존 설명',
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
        <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
          <Routes>
            <Route path="/todos/:todoId/edit" element={<TodoEditPage />} />
            <Route path="/todos/:todoId" element={<div>상세 페이지</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('할일 수정')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText('시작일 *') as HTMLInputElement;
    const dueDateInput = screen.getByLabelText('종료일 *') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2026-04-10' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-04-01' } });

    const saveButton = screen.getByRole('button', { name: /저장/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('종료일은 시작일 이후여야 합니다.')).toBeInTheDocument();
    });
  });
});
