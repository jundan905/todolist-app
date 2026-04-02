import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('텍스트가 렌더링된다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('disabled 상태에서 클릭이 안 된다', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>클릭</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('onClick이 호출된다', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('loading=true 시 버튼이 비활성화된다', () => {
    render(<Button loading>저장</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
