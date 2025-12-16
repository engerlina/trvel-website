'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Clock, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string | null;
  featured_image?: string | null;
  category?: string | null;
  author?: string | null;
  read_time?: number | null;
  published_at?: Date | null;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogCard({
  slug,
  title,
  excerpt,
  featured_image,
  category,
  author,
  read_time,
  published_at,
  variant = 'default',
}: BlogCardProps) {
  const formattedDate = published_at
    ? new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(published_at))
    : null;

  const categoryColors: Record<string, string> = {
    'travel-tips': 'bg-brand-100 text-brand-700',
    'destination-guides': 'bg-accent-100 text-accent-700',
    'tech': 'bg-navy-100 text-navy-500',
    'news': 'bg-cream-400 text-navy-500',
  };

  const categoryColor = category
    ? categoryColors[category] || 'bg-cream-300 text-navy-500'
    : 'bg-cream-300 text-navy-500';

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${slug}`} className="group block">
        <article className="relative overflow-hidden rounded-3xl bg-navy-500 aspect-[16/9] md:aspect-[21/9]">
          {/* Background Image */}
          {featured_image ? (
            <Image
              src={featured_image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-500 to-navy-500" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-500 via-navy-500/60 to-transparent" />

          {/* Decorative stamp */}
          <div className="absolute top-6 right-6 w-20 h-20 rounded-full border-4 border-dashed border-cream-300/30 flex items-center justify-center rotate-12 opacity-60">
            <span className="text-cream-300/50 text-xs font-bold tracking-wider">FEATURED</span>
          </div>

          {/* Content */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
            {category && (
              <span className={cn(
                'inline-block self-start px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4',
                'bg-cream-300/90 text-navy-500'
              )}>
                {category.replace('-', ' ')}
              </span>
            )}

            <h2 className="text-2xl md:text-4xl font-bold text-cream-50 mb-4 max-w-3xl leading-tight group-hover:text-brand-300 transition-colors">
              {title}
            </h2>

            {excerpt && (
              <p className="text-cream-200 text-lg mb-6 max-w-2xl line-clamp-2 hidden md:block">
                {excerpt}
              </p>
            )}

            <div className="flex items-center gap-6 text-cream-300 text-sm">
              {author && <span>{author}</span>}
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              )}
              {read_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {read_time} min read
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${slug}`} className="group block">
        <article className="flex gap-4 items-start">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
            {featured_image ? (
              <Image
                src={featured_image}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cream-300 to-cream-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {category && (
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                {category.replace('-', ' ')}
              </span>
            )}
            <h3 className="text-base font-semibold text-navy-500 mt-1 line-clamp-2 group-hover:text-brand-500 transition-colors">
              {title}
            </h3>
            {formattedDate && (
              <span className="text-xs text-navy-200 mt-2 block">{formattedDate}</span>
            )}
          </div>
        </article>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <article className="relative h-full bg-white rounded-2xl overflow-hidden border border-cream-300 shadow-soft transition-all duration-300 group-hover:shadow-soft-lg group-hover:border-brand-200 group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {featured_image ? (
            <Image
              src={featured_image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-300 to-brand-100">
              {/* Decorative pattern for no-image posts */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.4) 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              />
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4">
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                categoryColor
              )}>
                {category.replace('-', ' ')}
              </span>
            </div>
          )}

          {/* Postcard stamp decoration */}
          <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rotate-12">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-navy-200 mb-3">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
            {read_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {read_time} min
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-navy-500 mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-navy-300 text-sm line-clamp-2 mb-4">
              {excerpt}
            </p>
          )}

          {/* Author */}
          {author && (
            <div className="pt-4 border-t border-cream-200">
              <span className="text-sm text-navy-300">By {author}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
