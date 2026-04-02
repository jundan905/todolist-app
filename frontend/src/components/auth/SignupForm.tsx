import { useState } from 'react';
import { useSignup } from '../../hooks/useSignup';
import { getErrorMessage } from '../../utils/errorUtils';
import { isValidPassword } from '../../utils/validationUtils';

const passwordCriteria = [
  { label: '8~20자', test: (p: string) => p.length >= 8 && p.length <= 20 },
  { label: '대문자 포함', test: (p: string) => /[A-Z]/.test(p) },
  { label: '소문자 포함', test: (p: string) => /[a-z]/.test(p) },
  { label: '숫자 포함', test: (p: string) => /\d/.test(p) },
  { label: '특수문자(!@#$%^&*) 포함', test: (p: string) => /[!@#$%^&*]/.test(p) },
];

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const signupMutation = useSignup();

  const errorMessage = signupMutation.error ? getErrorMessage(signupMutation.error) : null;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isSubmitDisabled = signupMutation.isPending || passwordMismatch || !isValidPassword(password);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return;
    signupMutation.mutate({ name, email, password });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          이름
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>
      <div>
        <label htmlFor="signup-email" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          이메일
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>
      <div>
        <label htmlFor="signup-password" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          비밀번호
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        {password.length > 0 && (
          <ul style={{ marginTop: '8px', paddingLeft: 0, listStyle: 'none', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {passwordCriteria.map((c) => (
              <li key={c.label} style={{ color: c.test(password) ? '#0B8043' : 'var(--neutral-500)' }}>
                {c.test(password) ? '✓' : '✗'} {c.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label htmlFor="confirm-password" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          비밀번호 확인
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${passwordMismatch ? '#C62828' : 'var(--border-default)'}`,
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        {passwordMismatch && (
          <p style={{ color: '#C62828', fontSize: '12px', marginTop: '4px' }}>
            비밀번호가 일치하지 않습니다.
          </p>
        )}
      </div>
      {errorMessage && (
        <p role="alert" style={{ color: '#C62828', fontSize: '14px', margin: 0 }}>
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        style={{
          padding: '12px',
          backgroundColor: isSubmitDisabled ? 'var(--neutral-300)' : 'var(--brand-primary)',
          color: 'var(--neutral-000)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {signupMutation.isPending ? '처리 중...' : '회원가입'}
      </button>
    </form>
  );
}
