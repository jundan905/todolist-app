process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Mock before importing
const mockQuery = jest.fn();
jest.mock('../../../src/config/database', () => ({
  pool: {
    query: mockQuery,
  },
}));

import * as userRepository from '../../../src/repositories/userRepository';

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('이메일로 사용자를 조회하여 반환한다', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        password: 'hashed-password',
        name: '테스트유저',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, email, password, name, created_at FROM users WHERE email = $1',
        ['test@example.com'],
      );
    });

    it('이메일에 해당하는 사용자가 없으면 null 을 반환한다', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, email, password, name, created_at FROM users WHERE email = $1',
        ['notfound@example.com'],
      );
    });

    it('Parameterized Query 를 사용하여 SQL Injection 을 방어한다', async () => {
      const maliciousEmail = "'; DROP TABLE users; --";
      mockQuery.mockResolvedValue({ rows: [] });

      await userRepository.findByEmail(maliciousEmail);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [maliciousEmail],
      );
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs?.[0]).not.toContain('DROP TABLE');
    });
  });

  describe('insertUser', () => {
    it('새로운 사용자를 생성하고 생성된 사용자 정보를 반환한다', async () => {
      const mockNewUser = {
        id: 'new-user-uuid',
        email: 'newuser@example.com',
        name: '새유저',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      mockQuery.mockResolvedValue({ rows: [mockNewUser] });

      const result = await userRepository.insertUser(
        'newuser@example.com',
        'hashed-password',
        '새유저',
      );

      expect(result).toEqual(mockNewUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        ['newuser@example.com', 'hashed-password', '새유저'],
      );
    });

    it('비밀번호는 해시화된 상태로 저장된다', async () => {
      const hashedPassword = 'bcrypt-hashed-value';
      mockQuery.mockResolvedValue({
        rows: [{ id: 'uuid', email: 'test@example.com', name: '유저', created_at: new Date() }],
      });

      await userRepository.insertUser('test@example.com', hashedPassword, '유저');

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs?.[1]?.[1]).toBe(hashedPassword);
    });
  });

  describe('findById', () => {
    it('사용자 ID 로 사용자를 조회하여 반환한다', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: '테스트유저',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userRepository.findById('user-uuid-1');

      expect(result).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, email, name, created_at FROM users WHERE id = $1',
        ['user-uuid-1'],
      );
    });

    it('ID 에 해당하는 사용자가 없으면 null 을 반환한다', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userRepository.findById('non-existent-uuid');

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, email, name, created_at FROM users WHERE id = $1',
        ['non-existent-uuid'],
      );
    });

    it('Parameterized Query 를 사용하여 SQL Injection 을 방어한다', async () => {
      const maliciousId = "'; DROP TABLE users; --";
      mockQuery.mockResolvedValue({ rows: [] });

      await userRepository.findById(maliciousId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [maliciousId],
      );
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs?.[0]).not.toContain('DROP TABLE');
    });
  });
});
