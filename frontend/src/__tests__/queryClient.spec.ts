import { describe, it, expect } from 'vitest';
import { queryClient } from '../queryClient';

describe('QueryClient 설정', () => {
  it('QueryClient 인스턴스가 생성되어야 한다', () => {
    expect(queryClient).toBeDefined();
  });

  it('staleTime이 60초(60000ms)로 설정되어야 한다', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBe(60000);
  });

  it('retry가 1로 설정되어야 한다', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.retry).toBe(1);
  });

  it('refetchOnWindowFocus가 false로 설정되어야 한다', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });
});
