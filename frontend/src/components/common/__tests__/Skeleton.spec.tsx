import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoCardSkeleton } from '../Skeleton';

describe('TodoCardSkeleton', () => {
  it('스켈레톤 UI 가 렌더링된다', () => {
    const { container } = render(<TodoCardSkeleton />);
    // style 태그가 렌더링되는지 확인
    const styleElement = container.querySelector('style');
    expect(styleElement).toBeInTheDocument();
    expect(styleElement?.textContent).toContain('pulse');
  });

  it('스켈레톤 애니메이션 클래스가 적용된다', () => {
    const { container } = render(<TodoCardSkeleton />);
    const skeletonElements = container.querySelectorAll('.skeleton-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('스켈레톤 UI 가 올바른 구조를 가진다', () => {
    const { container } = render(<TodoCardSkeleton />);
    // 내부에 skeleton-pulse 클래스가 있는지 확인
    const skeletonElements = container.querySelectorAll('.skeleton-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
