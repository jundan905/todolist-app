import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';

vi.mock('../../../hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

function renderLoginForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LoginForm', () => {
  it('이메일 입력 필드가 렌더링된다', () => {
    renderLoginForm();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  });

  it('비밀번호 필드 타입이 password', () => {
    renderLoginForm();
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
  });

  it('폼 제출 시 mutate 호출', () => {
    const mockMutate = vi.fn();
    vi.doMock('../../../hooks/useLogin', () => ({
      useLogin: () => ({ mutate: mockMutate, isPending: false, error: null }),
    }));
    renderLoginForm();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'Password1!' } });
    fireEvent.submit(screen.getByRole('button', { name: '로그인' }));
  });

  it('에러 메시지가 렌더링된다', () => {
    vi.doMock('../../../hooks/useLogin', () => ({
      useLogin: () => ({
        mutate: vi.fn(),
        isPending: false,
        error: { response: { data: { error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }, status: 401 }, isAxiosError: true },
      }),
    }));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </QueryClientProvider>
    );
  });
});
