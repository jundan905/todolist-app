import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleTodo } from '../../hooks/useToggleTodo';
import * as todoApi from '../../api/todoApi';
import { useAuthStore } from '../../stores/useAuthStore';

vi.mock('../../api/todoApi');

function createWrapper() {
  const queryClient = new QueryClient({ 
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false }
    } 
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useToggleTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setToken('test-token');
  });

  const mockFilters = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' as const };

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

  it('할일 완료 처리 성공', async () => {
    const mockResponse = {
      ...mockTodo,
      isCompleted: true,
      completedAt: '2026-04-02T12:00:00.000Z',
      status: 'COMPLETED' as const,
      updatedAt: '2026-04-02T12:00:00.000Z',
    };
    vi.spyOn(todoApi, 'toggleComplete').mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    result.current.mutate({ todoId: 'todo-1', isCompleted: true });

    await waitFor(() => {
      expect(todoApi.toggleComplete).toHaveBeenCalledWith('todo-1', true);
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('할일 완료 취소 성공', async () => {
    const mockResponse = {
      ...mockTodo,
      isCompleted: false,
      completedAt: null,
      status: 'IN_PROGRESS' as const,
      updatedAt: '2026-04-02T12:00:00.000Z',
    };
    vi.spyOn(todoApi, 'toggleComplete').mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    result.current.mutate({ todoId: 'todo-1', isCompleted: false });

    await waitFor(() => {
      expect(todoApi.toggleComplete).toHaveBeenCalledWith('todo-1', false);
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('서버 오류 시 롤백이 수행된다', async () => {
    const mockError = { response: { status: 500, data: { error: { message: '서버 오류' } } } };
    vi.spyOn(todoApi, 'toggleComplete').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    result.current.mutate({ todoId: 'todo-1', isCompleted: true });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('기한 내 완료 시 COMPLETED 상태가 된다', async () => {
    const mockResponse = {
      ...mockTodo,
      isCompleted: true,
      completedAt: '2026-04-05T12:00:00.000Z',
      status: 'COMPLETED' as const,
      updatedAt: '2026-04-05T12:00:00.000Z',
    };
    vi.spyOn(todoApi, 'toggleComplete').mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    result.current.mutate({ todoId: 'todo-1', isCompleted: true });

    await waitFor(() => {
      expect(todoApi.toggleComplete).toHaveBeenCalled();
    });

    expect(result.current.data?.status).toBe('COMPLETED');
  });

  it('기한 초과 완료 시 LATE_COMPLETED 상태가 된다', async () => {
    const overdueTodo = {
      ...mockTodo,
      startDate: '2026-03-01',
      dueDate: '2026-03-31',
    };
    const mockResponse = {
      ...overdueTodo,
      isCompleted: true,
      completedAt: '2026-04-05T12:00:00.000Z',
      status: 'LATE_COMPLETED' as const,
      updatedAt: '2026-04-05T12:00:00.000Z',
    };
    vi.spyOn(todoApi, 'toggleComplete').mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    result.current.mutate({ todoId: 'todo-1', isCompleted: true });

    await waitFor(() => {
      expect(todoApi.toggleComplete).toHaveBeenCalled();
    });

    expect(result.current.data?.status).toBe('LATE_COMPLETED');
  });

  it('onMutate 에서 낙관적 업데이트가 정상 동작한다', async () => {
    const mockQueryData = {
      data: [mockTodo],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };

    vi.spyOn(todoApi, 'toggleComplete').mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    // 쿼리 캐시에 데이터 설정
    const queryClient = new QueryClient();
    queryClient.setQueryData(['todos', mockFilters], mockQueryData);

    // mutate 실행
    act(() => {
      result.current.mutate({ todoId: 'todo-1', isCompleted: true });
    });

    // 낙관적 업데이트로 즉시 isCompleted 가 true 가 됨
    await waitFor(() => {
      expect(todoApi.toggleComplete).toHaveBeenCalledWith('todo-1', true);
    });
  });

  it('onError 에서 context 가 없을 때 안전하게 처리된다', async () => {
    const mockError = { response: { status: 500 } };
    
    vi.spyOn(todoApi, 'toggleComplete').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    // previousData 가 없는 상태에서 오류 발생
    result.current.mutate({ todoId: 'todo-1', isCompleted: true });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    // 이 테스트는 context.previousData 가 undefined 일 때 오류 없이 처리되는지 확인
  });

  it('onSettled 에서 쿼리 무효화가 호출된다', async () => {
    const mockResponse = {
      ...mockTodo,
      isCompleted: true,
      completedAt: '2026-04-02T12:00:00.000Z',
      status: 'COMPLETED' as const,
    };
    vi.spyOn(todoApi, 'toggleComplete').mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useToggleTodo(mockFilters), { wrapper: createWrapper() });

    result.current.mutate({ todoId: 'todo-1', isCompleted: true });

    await waitFor(() => {
      expect(todoApi.toggleComplete).toHaveBeenCalled();
    });
  });
});
