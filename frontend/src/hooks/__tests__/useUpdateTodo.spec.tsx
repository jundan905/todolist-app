import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateTodo } from '../../hooks/useUpdateTodo';
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

describe('useUpdateTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setToken('test-token');
  });

  it('할일 수정 성공 시 캐시가 갱신된다', async () => {
    const mockUpdateResponse = {
      id: 'todo-1',
      userId: 'user-1',
      title: '수정된 제목',
      description: '수정된 설명',
      startDate: '2026-04-01',
      dueDate: '2026-04-10',
      isCompleted: false,
      completedAt: null,
      status: 'IN_PROGRESS',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-02T00:00:00.000Z',
    };
    vi.spyOn(todoApi, 'updateTodo').mockResolvedValueOnce(mockUpdateResponse);

    const { result } = renderHook(() => useUpdateTodo('todo-1'), { wrapper: createWrapper() });

    result.current.mutate({
      title: '수정된 제목',
      description: '수정된 설명',
    });

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalledWith('todo-1', {
        title: '수정된 제목',
        description: '수정된 설명',
      });
    });
  });

  it('종료일 < 시작일 시 400 에러', async () => {
    const mockError = { response: { status: 400, data: { error: { message: '종료일은 시작일 이상이어야 합니다' } } } };
    vi.spyOn(todoApi, 'updateTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdateTodo('todo-1'), { wrapper: createWrapper() });

    result.current.mutate({
      startDate: '2026-04-10',
      dueDate: '2026-04-01',
    });

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalled();
    });
  });

  it('존재하지 않는 할일 수정 시 404 에러', async () => {
    const mockError = { response: { status: 404, data: { error: { message: '할일을 찾을 수 없습니다' } } } };
    vi.spyOn(todoApi, 'updateTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdateTodo('nonexistent'), { wrapper: createWrapper() });

    result.current.mutate({ title: '수정' });

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalled();
    });
  });

  it('타인 할일 수정 시 403 에러', async () => {
    const mockError = { response: { status: 403, data: { error: { message: '접근 권한이 없습니다' } } } };
    vi.spyOn(todoApi, 'updateTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdateTodo('other-todo'), { wrapper: createWrapper() });

    result.current.mutate({ title: '수정' });

    await waitFor(() => {
      expect(todoApi.updateTodo).toHaveBeenCalled();
    });
  });
});
