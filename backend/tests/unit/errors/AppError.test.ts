import { AppError } from '../../../src/errors/AppError';

describe('AppError', () => {
  it('statusCode, code, message가 올바르게 설정됨', () => {
    const err = new AppError('테스트 오류', 400, 'TEST_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('TEST_ERROR');
    expect(err.message).toBe('테스트 오류');
    expect(err.name).toBe('AppError');
  });

  it('Error 인스턴스', () => {
    const err = new AppError('오류', 500, 'SERVER_ERROR');
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });
});
