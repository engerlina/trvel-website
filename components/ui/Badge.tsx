import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'brand' | 'success' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'badge-primary bg-brand-100 text-brand-700 border-brand-200',
  success: 'badge-success bg-success-100 text-success-600 border-success-200',
  neutral: 'badge-ghost bg-gray-100 text-gray-700 border-gray-200',
};

export function Badge({ variant = 'brand', children, className = '' }: BadgeProps) {
  return (
    <span className={cn(
      'badge gap-1.5 py-3 px-3 font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
