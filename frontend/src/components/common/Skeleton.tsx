export function TodoCardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .skeleton-pulse {
          animation: pulse 1.5s ease-in-out infinite;
          background: var(--neutral-100);
          border-radius: 4px;
        }
      `}</style>
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div className="skeleton-pulse" style={{ height: '22px', width: '60px' }} />
        <div className="skeleton-pulse" style={{ height: '18px', width: '80%' }} />
        <div className="skeleton-pulse" style={{ height: '14px', width: '100%' }} />
        <div className="skeleton-pulse" style={{ height: '14px', width: '70%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton-pulse" style={{ height: '14px', width: '40%' }} />
          <div className="skeleton-pulse" style={{ height: '20px', width: '20px', borderRadius: '50%' }} />
        </div>
      </div>
    </>
  );
}
