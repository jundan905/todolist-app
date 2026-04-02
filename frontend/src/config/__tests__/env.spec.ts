import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('env 설정', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('VITE_API_BASE_URL이 정의되어야 한다', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000');
    const { env } = await import('../env');
    expect(env.apiBaseUrl).toBe('http://localhost:3000');
    vi.unstubAllEnvs();
  });

  it('VITE_APP_TITLE 미설정 시 기본값 todolist-app을 반환해야 한다', async () => {
    vi.stubEnv('VITE_APP_TITLE', '');
    const { env } = await import('../env');
    expect(env.appTitle ?? 'todolist-app').toBe('todolist-app');
    vi.unstubAllEnvs();
  });

  it('VITE_APP_TITLE이 설정된 경우 해당 값을 반환해야 한다', async () => {
    vi.stubEnv('VITE_APP_TITLE', 'My Todo App');
    const { env } = await import('../env');
    expect(env.appTitle).toBe('My Todo App');
    vi.unstubAllEnvs();
  });
});
