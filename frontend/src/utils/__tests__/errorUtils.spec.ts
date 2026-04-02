import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errorUtils';
import axios from 'axios';

describe('getErrorMessage', () => {
  it('Axios 오류이고 서버 메시지가 있으면 서버 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: { message: '커스텀 에러 메시지' } },
      },
    };
    expect(getErrorMessage(error)).toBe('커스텀 에러 메시지');
  });

  it('400 오류 시 입력값 확인 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 400, data: {} },
    };
    expect(getErrorMessage(error)).toBe('입력값을 확인해주세요.');
  });

  it('401 오류 시 로그인 필요 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 401, data: {} },
    };
    expect(getErrorMessage(error)).toBe('로그인이 필요합니다.');
  });

  it('403 오류 시 접근 권한 없음 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 403, data: {} },
    };
    expect(getErrorMessage(error)).toBe('접근 권한이 없습니다.');
  });

  it('404 오류 시 항목을 찾을 수 없음 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 404, data: {} },
    };
    expect(getErrorMessage(error)).toBe('요청한 항목을 찾을 수 없습니다.');
  });

  it('409 오류 시 중복 이메일 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 409, data: {} },
    };
    expect(getErrorMessage(error)).toBe('이미 사용 중인 이메일입니다.');
  });

  it('500 오류 시 서버 오류 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 500, data: {} },
    };
    expect(getErrorMessage(error)).toBe('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  });

  it('알 수 없는 HTTP 상태 코드 시 기본 메시지를 반환한다', () => {
    const error = {
      isAxiosError: true,
      response: { status: 418, data: {} },
    };
    expect(getErrorMessage(error)).toBe('오류가 발생했습니다.');
  });

  it('Axios 오류가 아니면 기본 메시지를 반환한다', () => {
    const error = new Error('일반 오류');
    expect(getErrorMessage(error)).toBe('오류가 발생했습니다.');
  });

  it('error 가 null 이면 기본 메시지를 반환한다', () => {
    expect(getErrorMessage(null)).toBe('오류가 발생했습니다.');
  });

  it('error 가 undefined 이면 기본 메시지를 반환한다', () => {
    expect(getErrorMessage(undefined)).toBe('오류가 발생했습니다.');
  });
});
