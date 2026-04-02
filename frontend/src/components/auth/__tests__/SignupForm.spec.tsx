import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignupForm } from '../SignupForm';

vi.mock('../../../hooks/useSignup', () => ({
  useSignup: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

function renderSignupForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SignupForm', () => {
  it('이름 필드가 렌더링된다', () => {
    renderSignupForm();
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
  });

  it('이메일 필드가 렌더링된다', () => {
    renderSignupForm();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  });

  it('비밀번호 필드가 렌더링된다', () => {
    renderSignupForm();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('비밀번호 확인 필드가 렌더링된다', () => {
    renderSignupForm();
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
  });

  it('비밀번호 불일치 시 제출 버튼이 비활성화된다', () => {
    renderSignupForm();
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'DifferentPass1!' } });
    expect(screen.getByRole('button', { name: '회원가입' })).toBeDisabled();
  });
});
