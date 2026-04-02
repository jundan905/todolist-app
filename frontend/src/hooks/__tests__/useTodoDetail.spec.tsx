import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodoDetail } from '../../hooks/useTodoDetail';
import * as todoApi from '../../api/todoApi';
import { useAuthStore } from '../../stores/useAuthStore';

vi.mock('../../api/todoApi');

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useTodoDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setToken('test-token');
  });

  it('할일 상세 조회 성공', async () => {
    const mockTodo = {
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
    };
    vi.spyOn(todoApi, 'getTodo').mockResolvedValueOnce(mockTodo);

    const { result } = renderHook(() => useTodoDetail('todo-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTodo);
    });

    expect(todoApi.getTodo).toHaveBeenCalledWith('todo-1');
  });

  it('할일 ID 가 없으면 쿼리가 실행되지 않는다', () => {
    const { result } = renderHook(() => useTodoDetail(''), { wrapper: createWrapper() });

    expect(result.current.isEnabled).toBe(false);
  });

  it('존재하지 않는 할일 조회 시 404 에러', async () => {
    const mockError = { response: { status: 404, data: { error: { message: '할일을 찾을 수 없습니다' } } } };
    vi.spyOn(todoApi, 'getTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTodoDetail('nonexistent'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('타인 할일 접근 시 403 에러', async () => {
    const mockError = { response: { status: 403, data: { error: { message: '접근 권한이 없습니다' } } } };
    vi.spyOn(todoApi, 'getTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTodoDetail('other-todo'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
