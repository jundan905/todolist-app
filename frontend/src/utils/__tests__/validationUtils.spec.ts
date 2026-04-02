import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidDate,
  isDueDateValid,
  isValidLength,
} from '../validationUtils';

describe('isValidEmail', () => {
  it('유효한 이메일 형식 - 기본', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('유효한 이메일 형식 - 서브도메인', () => {
    expect(isValidEmail('user@mail.co.kr')).toBe(true);
  });

  it('유효한 이메일 형식 - 숫자 포함', () => {
    expect(isValidEmail('user123@domain.io')).toBe(true);
  });

  it('유효한 이메일 형식 - 플러스 기호 포함', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('유효하지 않은 이메일 - @ 없음', () => {
    expect(isValidEmail('invalidemail.com')).toBe(false);
  });

  it('유효하지 않은 이메일 - 도메인 없음', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('유효하지 않은 이메일 - 로컬파트 없음', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('유효하지 않은 이메일 - 빈 문자열', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('유효한 비밀번호 - 모든 조건 충족 (8 자)', () => {
    expect(isValidPassword('Password1!')).toBe(true);
  });

  it('유효한 비밀번호 - 특수문자 다양', () => {
    expect(isValidPassword('Abcdef1@')).toBe(true);
  });

  it('유효한 비밀번호 - 20 자 (최대 길이)', () => {
    expect(isValidPassword('Abcdefgh1!Abcdefgh1!')).toBe(true);
  });

  it('유효한 비밀번호 - 특수문자 $', () => {
    expect(isValidPassword('Password1$')).toBe(true);
  });

  it('유효한 비밀번호 - 특수문자 #', () => {
    expect(isValidPassword('Password1#')).toBe(true);
  });

  it('유효한 비밀번호 - 특수문자 %', () => {
    expect(isValidPassword('Password1%')).toBe(true);
  });

  it('유효한 비밀번호 - 특수문자 ^', () => {
    expect(isValidPassword('Password1^')).toBe(true);
  });

  it('유효한 비밀번호 - 특수문자 &', () => {
    expect(isValidPassword('Password1&')).toBe(true);
  });

  it('유효하지 않은 비밀번호 - 7 자 미만', () => {
    expect(isValidPassword('Abc1!')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 21 자 초과', () => {
    expect(isValidPassword('Abcdefgh1!Abcdefgh1!!')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 대문자 없음', () => {
    expect(isValidPassword('password1!')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 소문자 없음', () => {
    expect(isValidPassword('PASSWORD1!')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 숫자 없음', () => {
    expect(isValidPassword('Password!!')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 특수문자 없음', () => {
    expect(isValidPassword('Password123')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 빈 문자열', () => {
    expect(isValidPassword('')).toBe(false);
  });

  it('유효하지 않은 비밀번호 - 허용되지 않은 특수문자', () => {
    expect(isValidPassword('Password1_')).toBe(false);
  });
});

describe('isValidDate', () => {
  it('유효한 날짜 - 기본 형식', () => {
    expect(isValidDate('2026-04-01')).toBe(true);
  });

  it('유효한 날짜 - 연도 말', () => {
    expect(isValidDate('2026-12-31')).toBe(true);
  });

  it('유효한 날짜 - 연도 시작', () => {
    expect(isValidDate('2026-01-01')).toBe(true);
  });

  it('유효하지 않은 날짜 - 형식 오류 (슬래시)', () => {
    expect(isValidDate('2026/04/01')).toBe(false);
  });

  it('유효하지 않은 날짜 - 형식 오류 (점)', () => {
    expect(isValidDate('2026.04.01')).toBe(false);
  });

  it('유효하지 않은 날짜 - 월 오류 (13 월)', () => {
    expect(isValidDate('2026-13-01')).toBe(false);
  });

  it('유효하지 않은 날짜 - 일 오류 (32 일)', () => {
    expect(isValidDate('2026-04-32')).toBe(false);
  });

  it('유효하지 않은 날짜 - 빈 문자열', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('유효하지 않은 날짜 - null', () => {
    expect(isValidDate(null as unknown as string)).toBe(false);
  });
});

describe('isDueDateValid', () => {
  it('dueDate 가 startDate 와 같으면 유효', () => {
    expect(isDueDateValid('2026-04-01', '2026-04-01')).toBe(true);
  });

  it('dueDate 가 startDate 보다 이후이면 유효', () => {
    expect(isDueDateValid('2026-04-01', '2026-04-30')).toBe(true);
  });

  it('dueDate 가 startDate 보다 훨씬 이후이면 유효', () => {
    expect(isDueDateValid('2026-01-01', '2026-12-31')).toBe(true);
  });

  it('dueDate 가 startDate 보다 이전이면 유효하지 않음', () => {
    expect(isDueDateValid('2026-04-30', '2026-04-01')).toBe(false);
  });

  it('dueDate 가 startDate 보다 훨씬 이전이면 유효하지 않음', () => {
    expect(isDueDateValid('2026-12-31', '2026-01-01')).toBe(false);
  });
});

describe('isValidLength', () => {
  it('길이가 최소 길이와 같으면 유효', () => {
    expect(isValidLength('12345', 5, 10)).toBe(true);
  });

  it('길이가 최대 길이와 같으면 유효', () => {
    expect(isValidLength('1234567890', 5, 10)).toBe(true);
  });

  it('길이가 최소와 최대 사이면 유효', () => {
    expect(isValidLength('1234567', 5, 10)).toBe(true);
  });

  it('길이가 최소 미만이면 유효하지 않음', () => {
    expect(isValidLength('1234', 5, 10)).toBe(false);
  });

  it('길이가 최대 초과이면 유효하지 않음', () => {
    expect(isValidLength('12345678901', 5, 10)).toBe(false);
  });

  it('빈 문자열 - 최소 0 일 때 유효', () => {
    expect(isValidLength('', 0, 10)).toBe(true);
  });

  it('빈 문자열 - 최소 1 이상일 때 유효하지 않음', () => {
    expect(isValidLength('', 1, 10)).toBe(false);
  });

  it('한글 문자 - 길이 정상 계산', () => {
    expect(isValidLength('가나다라마', 5, 10)).toBe(true);
  });
});
