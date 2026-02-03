'use client';

import { useEffect, useState, useRef, ReactNode, ComponentType } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Lazy loads children when they come into view
 * Improves FCP and Speed Index by deferring below-fold content
 */
export function LazySection({
  children,
  fallback = null,
  rootMargin = '100px',
  threshold = 0,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If IntersectionObserver is not supported, show immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}

interface LazyComponentProps<P extends object> {
  component: ComponentType<P>;
  props: P;
  fallback?: ReactNode;
  rootMargin?: string;
}

/**
 * Dynamically imports and renders a component when it comes into view
 */
export function LazyComponent<P extends object>({
  component: Component,
  props,
  fallback = null,
  rootMargin = '100px',
}: LazyComponentProps<P>) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? <Component {...props} /> : fallback}
    </div>
  );
}
