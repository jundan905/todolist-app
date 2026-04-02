import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import * as authApi from '../../api/authApi';
import { useAuthStore } from '../../stores/useAuthStore';

vi.mock('../../api/authApi');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('로그인 성공 시 토큰과 사용자 정보가 저장된다', async () => {
    const mockLoginResponse = {
      accessToken: 'test-access-token',
      expiresIn: 3600,
      user: { id: 'user-1', email: 'test@example.com', name: '테스터', createdAt: '2026-04-01T00:00:00.000Z' },
    };
    vi.spyOn(authApi, 'login').mockResolvedValueOnce(mockLoginResponse);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'Password1!' });

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'Password1!' });
    });

    expect(useAuthStore.getState().accessToken).toBe('test-access-token');
    expect(useAuthStore.getState().user).toEqual(mockLoginResponse.user);
  });

  it('로그인 실패 시 에러가 반환된다', async () => {
    const mockError = { response: { status: 401, data: { error: { message: '이메일 또는 비밀번호가 올바르지 않습니다' } } } };
    vi.spyOn(authApi, 'login').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'WrongPassword' });

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
    });
  });

  it('isPending 상태가 로딩 중에 true 가 된다', async () => {
    vi.spyOn(authApi, 'login').mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'Password1!' });

    // isPending 은 mutation 이 실행 중일 때 true 가 됨
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });
});
