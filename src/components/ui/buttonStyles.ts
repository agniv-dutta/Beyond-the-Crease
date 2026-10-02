import { cn } from '@/utils/cn';

/**
 * Shared button class builder, kept in its own module so the component file
 * only exports components and fast refresh behaves.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'soft' | 'pistachio';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-pomelo text-ink shadow-btc-pomelo hover:bg-pomelo-soft active:translate-y-[2px] active:shadow-none',
  secondary: 'bg-kesar text-ink shadow-btc-kesar hover:bg-kesar-soft active:translate-y-[2px] active:shadow-none',
  pistachio: 'bg-pistachio text-ink shadow-btc hover:bg-pistachio-soft active:translate-y-[2px] active:shadow-none',
  soft: 'bg-rose-soft text-ink hover:bg-rose',
  outline: 'hairline bg-transparent text-body hover:bg-surface-raised',
  ghost: 'bg-transparent text-body hover:bg-surface-raised',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm gap-1.5 rounded-xl',
  md: 'min-h-11 px-4 py-2 text-sm gap-2 rounded-2xl',
  lg: 'min-h-[3.25rem] px-6 py-3 text-base gap-2.5 rounded-2xl',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    'varq inline-flex select-none items-center justify-center font-semibold transition-all duration-200 ease-silk',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-surface',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}