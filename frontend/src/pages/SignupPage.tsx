import { SignupForm } from '../components/auth/SignupForm';

function SignupPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-page)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--surface-card)',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--brand-primary)',
          }}
        >
          회원가입
        </h1>
        <SignupForm />
      </div>
    </main>
  );
}

export default SignupPage;
