process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/utils/passwordUtils');

import * as authService from '../../../src/services/authService';
import * as userRepository from '../../../src/repositories/userRepository';
import * as passwordUtils from '../../../src/utils/passwordUtils';
import { AppError } from '../../../src/errors/AppError';

const mockFindByEmail = userRepository.findByEmail as jest.MockedFunction<typeof userRepository.findByEmail>;
const mockInsertUser = userRepository.insertUser as jest.MockedFunction<typeof userRepository.insertUser>;
const mockHashPassword = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;
const mockComparePassword = passwordUtils.comparePassword as jest.MockedFunction<typeof passwordUtils.comparePassword>;

const VALID_PASSWORD = 'Test@1234';
const WEAK_PASSWORD = 'weakpassword';

const mockUserRow = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  password: 'hashed-password',
  name: '테스트유저',
  created_at: new Date('2024-01-01T00:00:00Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authService.signup', () => {
  it('성공: 유효한 정보로 회원가입하면 사용자 정보와 성공 메시지를 반환한다', async () => {
    mockFindByEmail.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue('hashed-password');
    mockInsertUser.mockResolvedValue(mockUserRow);

    const result = await authService.signup('test@example.com', VALID_PASSWORD, '테스트유저');

    expect(result).toEqual({
      id: mockUserRow.id,
      email: mockUserRow.email,
      name: mockUserRow.name,
      createdAt: mockUserRow.created_at,
      message: '회원가입 성공',
    });
    expect(mockHashPassword).toHaveBeenCalledWith(VALID_PASSWORD);
    expect(mockInsertUser).toHaveBeenCalledWith('test@example.com', 'hashed-password', '테스트유저');
  });

  it('실패: 비밀번호 복잡도 미충족 시 400 INVALID_PASSWORD 에러를 던진다', async () => {
    await expect(
      authService.signup('test@example.com', WEAK_PASSWORD, '테스트유저'),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_PASSWORD',
    });
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });

  it('실패: 이미 존재하는 이메일이면 409 EMAIL_DUPLICATE 에러를 던진다', async () => {
    mockFindByEmail.mockResolvedValue(mockUserRow);

    await expect(
      authService.signup('test@example.com', VALID_PASSWORD, '테스트유저'),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'EMAIL_DUPLICATE',
    });
    expect(mockInsertUser).not.toHaveBeenCalled();
  });
});

describe('authService.login', () => {
  it('성공: 유효한 이메일과 비밀번호로 로그인하면 accessToken과 사용자 정보를 반환한다', async () => {
    mockFindByEmail.mockResolvedValue(mockUserRow);
    mockComparePassword.mockResolvedValue(true);

    const result = await authService.login('test@example.com', VALID_PASSWORD);

    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
    expect(result.expiresIn).toBe(3600);
    expect(result.user).toEqual({
      id: mockUserRow.id,
      email: mockUserRow.email,
      name: mockUserRow.name,
      createdAt: mockUserRow.created_at,
    });
  });

  it('실패: 존재하지 않는 이메일로 로그인 시 401 INVALID_CREDENTIALS 에러를 던진다', async () => {
    mockFindByEmail.mockResolvedValue(null);

    await expect(
      authService.login('notfound@example.com', VALID_PASSWORD),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
    expect(mockComparePassword).not.toHaveBeenCalled();
  });

  it('실패: 비밀번호가 일치하지 않으면 401 INVALID_CREDENTIALS 에러를 던진다', async () => {
    mockFindByEmail.mockResolvedValue(mockUserRow);
    mockComparePassword.mockResolvedValue(false);

    await expect(
      authService.login('test@example.com', 'WrongPass@1'),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });
});
