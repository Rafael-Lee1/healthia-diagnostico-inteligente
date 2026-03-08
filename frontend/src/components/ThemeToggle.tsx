import { Button } from '@/components/ui/Button';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onToggle}
      aria-label={label}
      className="min-w-[132px]"
      iconLeft={
        theme === 'dark' ? (
          <span aria-hidden="true">☀️</span>
        ) : (
          <span aria-hidden="true">🌙</span>
        )
      }
    >
      {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
    </Button>
  );
}
