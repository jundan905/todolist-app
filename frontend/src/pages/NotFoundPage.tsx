import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        color: 'var(--neutral-700)',
      }}
    >
      <h1 style={{ fontSize: '48px', fontWeight: 700, color: 'var(--neutral-300)' }}>404</h1>
      <p style={{ fontSize: '18px' }}>페이지를 찾을 수 없습니다.</p>
      <Link
        to="/todos"
        style={{
          padding: '10px 20px',
          background: 'var(--brand-primary)',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        홈으로 이동
      </Link>
    </div>
  );
}

export default NotFoundPage;
