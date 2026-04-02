import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useSignup } from '../../hooks/useSignup';
import * as authApi from '../../api/authApi';

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

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('회원가입 성공 시 /login 으로 이동한다', async () => {
    const mockSignupResponse = {
      id: 'user-1',
      email: 'test@example.com',
      name: '테스터',
      createdAt: '2026-04-01T00:00:00.000Z',
      message: '회원가입 성공',
    };
    vi.spyOn(authApi, 'signup').mockResolvedValueOnce(mockSignupResponse);

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'test@example.com',
      password: 'Password1!',
      name: '테스터',
    });

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1!',
        name: '테스터',
      });
    });
  });

  it('회원가입 실패 시 에러가 반환된다', async () => {
    const mockError = { response: { status: 409, data: { error: { message: '이미 가입된 이메일입니다' } } } };
    vi.spyOn(authApi, 'signup').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'existing@example.com',
      password: 'Password1!',
      name: '테스터',
    });

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalled();
    });
  });

  it('비밀번호 복잡도 위반 시 400 에러가 반환된다', async () => {
    const mockError = { response: { status: 400, data: { error: { message: '비밀번호 복잡도 규칙을 충족하지 못했습니다' } } } };
    vi.spyOn(authApi, 'signup').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'test@example.com',
      password: 'weak',
      name: '테스터',
    });

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalled();
    });
  });
});
