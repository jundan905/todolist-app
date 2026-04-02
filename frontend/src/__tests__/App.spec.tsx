import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import App from '../App';
import { useAuthStore } from '../stores/useAuthStore';

const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderApp(initialRoute: string) {
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('App 라우팅', () => {
  it('/login 경로에서 로그인 페이지가 렌더링되어야 한다', () => {
    renderApp('/login');
    expect(screen.getAllByText('로그인')[0]).toBeInTheDocument();
  });

  it('/signup 경로에서 회원가입 페이지가 렌더링되어야 한다', () => {
    renderApp('/signup');
    expect(screen.getAllByText('회원가입')[0]).toBeInTheDocument();
  });

  it('/todos 경로는 토큰 없으면 /login 으로 리다이렉트 된다', () => {
    renderApp('/todos');
    expect(screen.getAllByText('로그인')[0]).toBeInTheDocument();
  });

  it('/todos 경로는 유효한 토큰으로 할일 목록 페이지가 렌더링 된다', () => {
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setToken(validToken);
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스터' });
    renderApp('/todos');
    expect(screen.getByText('할일 목록')).toBeInTheDocument();
  });

  it('/ 경로는 토큰 없으면 /todos → /login 으로 리다이렉트 된다', () => {
    renderApp('/');
    expect(screen.getAllByText('로그인')[0]).toBeInTheDocument();
  });

  it('존재하지 않는 경로는 404 페이지가 렌더링 된다', () => {
    renderApp('/nonexistent');
    expect(screen.getByText('페이지를 찾을 수 없습니다.')).toBeInTheDocument();
  });
});
