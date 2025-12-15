import { ReactNode } from 'react';

type BadgeVariant = 'brand' | 'success' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'badge-brand',
  success: 'badge-success',
  neutral: 'badge bg-gray-100 text-gray-700',
};

export function Badge({ variant = 'brand', children, className = '' }: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
