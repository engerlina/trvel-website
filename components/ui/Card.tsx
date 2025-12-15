import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'card-body p-4',
  md: 'card-body p-6',
  lg: 'card-body p-8',
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div className={cn(
      'card bg-base-100 shadow-soft border border-gray-100',
      hover && 'transition-all duration-300 hover:shadow-soft-lg hover:border-brand-200 hover:-translate-y-1',
      className
    )}>
      {padding !== 'none' ? (
        <div className={paddingClasses[padding]}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
