import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../../pages/LoginPage';
import { useAuthStore } from '../../stores/useAuthStore';

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderLoginFlow() {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/todos" element={<div>할일 목록 페이지</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('LoginFlow 통합 테스트', () => {
  it('올바른 자격증명으로 로그인 후 /todos로 이동', async () => {
    renderLoginFlow();

    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByText('할일 목록 페이지')).toBeInTheDocument();
    });
  });

  it('잘못된 자격증명 → 에러 메시지 표시', async () => {
    renderLoginFlow();

    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'WrongPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다.');
    });
  });
});
