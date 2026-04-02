import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateTodo } from '../../hooks/useCreateTodo';
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

describe('useCreateTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setToken('test-token');
  });

  it('할일 생성 성공 시 목록이 리페칭된다', async () => {
    const mockCreateResponse = {
      id: 'todo-1',
      userId: 'user-1',
      title: '새 할일',
      description: '설명',
      startDate: '2026-04-05',
      dueDate: '2026-04-15',
      isCompleted: false,
      completedAt: null,
      status: 'UPCOMING',
      createdAt: '2026-04-02T00:00:00.000Z',
      updatedAt: '2026-04-02T00:00:00.000Z',
    };
    vi.spyOn(todoApi, 'createTodo').mockResolvedValueOnce(mockCreateResponse);

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    result.current.mutate({
      title: '새 할일',
      description: '설명',
      startDate: '2026-04-05',
      dueDate: '2026-04-15',
    });

    await waitFor(() => {
      expect(todoApi.createTodo).toHaveBeenCalledWith({
        title: '새 할일',
        description: '설명',
        startDate: '2026-04-05',
        dueDate: '2026-04-15',
      });
    });
  });

  it('할일 생성 실패 시 에러가 반환된다', async () => {
    const mockError = { response: { status: 400, data: { error: { message: '종료일은 시작일 이상이어야 합니다' } } } };
    vi.spyOn(todoApi, 'createTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    result.current.mutate({
      title: '잘못된 할일',
      startDate: '2026-04-10',
      dueDate: '2026-04-01',
    });

    await waitFor(() => {
      expect(todoApi.createTodo).toHaveBeenCalled();
    });
  });

  it('제목 누락 시 400 에러가 반환된다', async () => {
    const mockError = { response: { status: 400, data: { error: { message: '제목은 필수입니다' } } } };
    vi.spyOn(todoApi, 'createTodo').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    result.current.mutate({
      title: '',
      startDate: '2026-04-01',
      dueDate: '2026-04-10',
    });

    await waitFor(() => {
      expect(todoApi.createTodo).toHaveBeenCalled();
    });
  });
});
