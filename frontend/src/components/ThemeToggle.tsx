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
      className="min-w-[136px]"
      iconLeft={
        theme === 'dark' ? (
          <span aria-hidden="true" className="text-base leading-none">☀</span>
        ) : (
          <span aria-hidden="true" className="text-base leading-none">◐</span>
        )
      }
    >
      {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
    </Button>
  );
}
