import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PublicRoute } from '../index';
import { useAuthStore } from '../../stores/useAuthStore';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <div>로그인 페이지</div>
            </PublicRoute>
          }
        />
        <Route path="/todos" element={<div>할일 목록 페이지</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('PublicRoute', () => {
  it('토큰이 없을 때 children 렌더링', () => {
    renderWithRoute('/login');
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
  });

  it('유효한 토큰이 있을 때 /todos 으로 리다이렉트', () => {
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setToken(validToken);
    renderWithRoute('/login');
    expect(screen.getByText('할일 목록 페이지')).toBeInTheDocument();
  });

  it('만료된 토큰일 때 children 렌더링', () => {
    const expiredToken = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
    useAuthStore.getState().setToken(expiredToken);
    renderWithRoute('/login');
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
  });
});
