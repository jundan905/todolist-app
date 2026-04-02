import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('label 이 있으면 렌더링된다', () => {
    render(<Input id="test" label="테스트 레이블" />);
    expect(screen.getByText('테스트 레이블')).toBeInTheDocument();
  });

  it('label 이 없으면 렌더링되지 않는다', () => {
    render(<Input id="test" />);
    expect(screen.queryByText('테스트 레이블')).not.toBeInTheDocument();
  });

  it('error 가 있으면 에러 메시지가 렌더링된다', () => {
    render(<Input id="test" error="에러 메시지" />);
    expect(screen.getByText('에러 메시지')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('error 가 없으면 에러 메시지가 렌더링되지 않는다', () => {
    render(<Input id="test" />);
    expect(screen.queryByText('에러 메시지')).not.toBeInTheDocument();
  });

  it('error 가 있으면 테두리 색상이 빨간색이 된다', () => {
    render(<Input id="test" error="에러" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('border: 1px solid #C62828');
  });

  it('error 가 없으면 테두리 색상이 기본색이 된다', () => {
    render(<Input id="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('border: 1px solid var(--border-default)');
  });

  it('추가 스타일 속성이 적용된다', () => {
    render(<Input id="test" style={{ backgroundColor: 'red' }} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('HTML input 속성이 전달된다', () => {
    render(<Input id="email" type="email" placeholder="이메일 입력" required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', '이메일 입력');
    expect(input).toHaveAttribute('required');
  });
});
