interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 24 }: SpinnerProps) {
  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        role="status"
        aria-label="로딩 중"
        style={{
          width: size,
          height: size,
          border: '3px solid var(--neutral-100)',
          borderTop: '3px solid var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block',
        }}
      />
    </>
  );
}
