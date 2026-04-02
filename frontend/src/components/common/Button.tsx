import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--brand-primary)', color: '#fff', border: 'none' },
  secondary: { backgroundColor: 'transparent', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)' },
  danger: { backgroundColor: '#C62828', color: '#fff', border: 'none' },
  ghost: { backgroundColor: 'transparent', color: 'var(--neutral-700)', border: '1px solid var(--border-default)' },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '13px' },
  md: { padding: '10px 18px', fontSize: '14px' },
  lg: { padding: '14px 24px', fontSize: '16px' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: '6px',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}
