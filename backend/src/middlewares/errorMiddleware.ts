import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } });
};
