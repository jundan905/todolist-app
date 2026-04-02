import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast, useToastStore } from '../Toast';

describe('Toast', () => {
  beforeEach(() => {
    useToastStore.getState().toasts.forEach((toast) => {
      useToastStore.getState().removeToast(toast.id);
    });
  });

  it('토스트가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<Toast />);
    expect(container.firstChild).toBeNull();
  });

  it('성공 토스트가 추가된다', () => {
    const { addToast } = useToastStore.getState();
    addToast('성공했습니다!', 'success');

    render(<Toast />);

    expect(screen.getByText('성공했습니다!')).toBeInTheDocument();
  });

  it('에러 토스트가 추가된다', () => {
    const { addToast } = useToastStore.getState();
    addToast('오류가 발생했습니다.', 'error');

    render(<Toast />);

    expect(screen.getByText('오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('경고 토스트가 추가된다', () => {
    const { addToast } = useToastStore.getState();
    addToast('주의가 필요합니다.', 'warning');

    render(<Toast />);

    expect(screen.getByText('주의가 필요합니다.')).toBeInTheDocument();
  });

  it('토스트가 3 초 후 자동으로 사라진다', async () => {
    const { addToast } = useToastStore.getState();
    addToast('자동 닫힘 테스트', 'success');

    render(<Toast />);

    expect(screen.getByText('자동 닫힘 테스트')).toBeInTheDocument();

    // 3 초 + 약간의 여유시간을 주어 테스트 안정성 확보
    await waitFor(
      () => {
        expect(screen.queryByText('자동 닫힘 테스트')).not.toBeInTheDocument();
      },
      { timeout: 3500 }
    );
  });

  it('닫기 버튼 클릭 시 토스트가 즉시 사라진다', () => {
    const { addToast } = useToastStore.getState();
    addToast('수동 닫힘 테스트', 'success');

    render(<Toast />);

    const closeButton = screen.getByLabelText('닫기');
    fireEvent.click(closeButton);

    expect(screen.queryByText('수동 닫힘 테스트')).not.toBeInTheDocument();
  });

  it('여러 토스트가 동시에 표시된다', () => {
    const { addToast } = useToastStore.getState();
    addToast('첫 번째 토스트', 'success');
    addToast('두 번째 토스트', 'error');
    addToast('세 번째 토스트', 'warning');

    render(<Toast />);

    expect(screen.getByText('첫 번째 토스트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 토스트')).toBeInTheDocument();
    expect(screen.getByText('세 번째 토스트')).toBeInTheDocument();
  });

  it('타입별 색상이 정확히 적용된다', () => {
    const { addToast } = useToastStore.getState();
    
    addToast('성공 메시지', 'success');
    render(<Toast />);
    
    const toastElement = screen.getByText('성공 메시지').closest('div');
    expect(toastElement).toHaveStyle('border-left: 4px solid #0B8043');
  });
});
