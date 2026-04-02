import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
      style={{
        padding: '6px',
        border: '1px solid var(--border-default)',
        borderRadius: '6px',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--neutral-700)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
      title={theme === 'light' ? '다크모드' : '라이트모드'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
