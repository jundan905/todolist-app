import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import * as userRepository from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { AppError } from '../errors/AppError';
import { User } from '../types/auth.types';

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[`!@#$%^&*])[A-Za-z\d`!@#$%^&*]{8,20}$/;

export const signup = async (
  email: string,
  password: string,
  name: string,
): Promise<{ id: string; email: string; name: string; createdAt: Date; message: string }> => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new AppError('비밀번호가 복잡도 요건을 충족하지 않습니다.', 400, 'INVALID_PASSWORD');
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('이미 사용 중인 이메일입니다.', 409, 'EMAIL_DUPLICATE');
  }

  const hashedPassword = await hashPassword(password);
  const row = await userRepository.insertUser(email, hashedPassword, name);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    message: '회원가입 성공',
  };
};

export const login = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; expiresIn: number; user: User }> => {
  const row = await userRepository.findByEmail(email);
  if (!row) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await comparePassword(password, row.password);
  if (!isMatch) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = jwt.sign(
    { userId: row.id, email: row.email },
    config.jwt.secret,
    { algorithm: 'HS256', expiresIn: config.jwt.expiresIn },
  );

  const user: User = {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };

  return { accessToken, expiresIn: config.jwt.expiresIn, user };
};
