'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, isLoading, className = '', disabled, ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-semibold tracking-tight
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

    const variants: Record<ButtonVariant, string> = {
      primary: `
        bg-gradient-to-r from-accent-500 via-accent-600 to-accent-700
        text-white shadow-md
        hover:shadow-lg hover:shadow-glow-accent hover:-translate-y-0.5
        active:translate-y-0 active:shadow-md
        focus-visible:ring-accent-500
      `,
      secondary: `
        bg-white text-brand-400
        border-2 border-brand-400
        hover:bg-brand-50 hover:border-brand-500 hover:-translate-y-0.5
        active:translate-y-0 active:bg-brand-100
        focus-visible:ring-brand-400
      `,
      ghost: `
        bg-transparent text-navy-500
        hover:bg-cream-200
        focus-visible:ring-brand-400
      `,
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-2.5 text-base rounded-xl',
      lg: 'px-8 py-3.5 text-lg rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
