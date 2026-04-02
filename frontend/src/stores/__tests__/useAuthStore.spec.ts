import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('useAuthStore', () => {
  it('초기 상태에서 accessToken과 user는 null', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setToken으로 accessToken 설정', () => {
    useAuthStore.getState().setToken('test-token');
    expect(useAuthStore.getState().accessToken).toBe('test-token');
  });

  it('setUser로 user 설정', () => {
    const user = { id: 'user-1', email: 'test@example.com', name: '테스트' };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('clearAuth 후 accessToken과 user가 null', () => {
    useAuthStore.getState().setToken('test-token');
    useAuthStore.getState().setUser({ id: 'user-1', email: 'test@example.com', name: '테스트' });
    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('token이 없으면 isTokenExpired()는 true', () => {
    expect(useAuthStore.getState().isTokenExpired()).toBe(true);
  });

  it('만료된 JWT로 isTokenExpired()는 true', () => {
    const expiredToken = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
    useAuthStore.getState().setToken(expiredToken);
    expect(useAuthStore.getState().isTokenExpired()).toBe(true);
  });

  it('유효한 JWT로 isTokenExpired()는 false', () => {
    const validToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setToken(validToken);
    expect(useAuthStore.getState().isTokenExpired()).toBe(false);
  });
});
