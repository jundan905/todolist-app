import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error?.message;
    if (serverMessage) return serverMessage as string;

    const status = error.response?.status;
    switch (status) {
      case 400: return '입력값을 확인해주세요.';
      case 401: return '로그인이 필요합니다.';
      case 403: return '접근 권한이 없습니다.';
      case 404: return '요청한 항목을 찾을 수 없습니다.';
      case 409: return '이미 사용 중인 이메일입니다.';
      case 500: return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default: return '오류가 발생했습니다.';
    }
  }
  return '오류가 발생했습니다.';
}
