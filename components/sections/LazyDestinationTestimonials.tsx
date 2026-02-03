'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Skeleton loader that matches the testimonials layout
function TestimonialsSkeleton() {
  return (
    <section className="py-16 bg-cream-50">
      <div className="container-wide">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-cream-200 rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-cream-200 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-cream-200 p-6 h-64 animate-pulse"
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="w-4 h-4 bg-cream-200 rounded" />
                ))}
              </div>
              <div className="space-y-2 mb-5">
                <div className="h-4 bg-cream-200 rounded w-full" />
                <div className="h-4 bg-cream-200 rounded w-5/6" />
                <div className="h-4 bg-cream-200 rounded w-4/6" />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-cream-100">
                <div className="w-10 h-10 bg-cream-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-cream-200 rounded w-24" />
                  <div className="h-3 bg-cream-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Dynamic import of the testimonials component
const DestinationTestimonials = dynamic(
  () => import('./DestinationTestimonials').then((mod) => mod.DestinationTestimonials),
  {
    loading: () => <TestimonialsSkeleton />,
    ssr: true, // Keep SSR for SEO
  }
);

interface LazyDestinationTestimonialsProps {
  destinationSlug: string;
  destinationName: string;
}

/**
 * Lazy-loads testimonials section when it comes into view
 * Improves Speed Index by deferring non-critical below-fold content
 */
export function LazyDestinationTestimonials({
  destinationSlug,
  destinationName,
}: LazyDestinationTestimonialsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If IntersectionObserver is not supported, show immediately
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <DestinationTestimonials
          destinationSlug={destinationSlug}
          destinationName={destinationName}
        />
      ) : (
        <TestimonialsSkeleton />
      )}
    </div>
  );
}
