import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from '../errors/AppError';

export const handleSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new AppError('필수 입력값이 누락되었습니다.', 400, 'MISSING_FIELDS');
    }
    const result = await authService.signup(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('필수 입력값이 누락되었습니다.', 400, 'MISSING_FIELDS');
    }
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const handleLogout = (_req: Request, res: Response): void => {
  res.status(200).json({ message: '로그아웃 성공' });
};
