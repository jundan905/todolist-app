interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, style, ...rest }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{ fontWeight: 500, fontSize: '14px', color: 'var(--neutral-700)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          padding: '10px 12px',
          border: `1px solid ${error ? '#C62828' : 'var(--border-default)'}`,
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
          ...style,
        }}
        {...rest}
      />
      {error && (
        <span role="alert" style={{ color: '#C62828', fontSize: '12px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
