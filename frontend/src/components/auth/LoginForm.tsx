import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../hooks/useLogin';
import { getErrorMessage } from '../../utils/errorUtils';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const loginMutation = useLogin();

  const errorMessage = loginMutation.error ? getErrorMessage(loginMutation.error) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('auth.login.email')}
        </label>
        <input
          id="email"
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
        <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          {t('auth.login.password')}
        </label>
        <input
          id="password"
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
      </div>
      {errorMessage && (
        <p role="alert" style={{ color: '#C62828', fontSize: '14px', margin: 0 }}>
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        style={{
          padding: '12px',
          backgroundColor: loginMutation.isPending ? 'var(--neutral-300)' : 'var(--brand-primary)',
          color: 'var(--neutral-000)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {loginMutation.isPending ? '...' : t('auth.login.submit')}
      </button>
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--neutral-500)' }}>
        {t('auth.login.noAccount')}{' '}
        <Link to="/signup" style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
          {t('auth.login.signup')}
        </Link>
      </p>
    </form>
  );
}
