import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui';

const testimonials = [
  {
    id: 'sarah',
    rating: 5,
    location: 'Melbourne',
    destination: 'Tokyo',
  },
  {
    id: 'james',
    rating: 5,
    location: 'Sydney',
    destination: 'Bangkok',
  },
  {
    id: 'emma',
    rating: 5,
    location: 'Brisbane',
    destination: 'Seoul',
  },
  {
    id: 'michael',
    rating: 5,
    location: 'Perth',
    destination: 'Singapore',
  },
];

export function Testimonials() {
  const t = useTranslations('home.testimonials');

  return (
    <section aria-labelledby="testimonials-heading" className="section bg-white">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 id="testimonials-heading" className="text-heading-xl md:text-display font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id}>
              <Card hover padding="lg" className="relative h-full">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6" aria-hidden="true">
                  <Quote className="w-8 h-8 text-brand-100" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-body text-gray-700 mb-6 leading-relaxed">
                  "{t(`${testimonial.id}.quote`)}"
                </blockquote>

                {/* Author */}
                <footer className="pt-4 border-t border-gray-100">
                  <p className="text-body font-semibold text-gray-900">
                    {t(`${testimonial.id}.name`)}
                  </p>
                  <p className="text-body-sm text-gray-500">
                    {testimonial.location} → {testimonial.destination}
                  </p>
                </footer>
              </Card>
            </article>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-display font-bold text-brand-600">50K+</p>
            <p className="text-body-sm text-gray-600">{t('stats.travelers')}</p>
          </div>
          <div className="text-center">
            <p className="text-display font-bold text-brand-600">4.9</p>
            <p className="text-body-sm text-gray-600">{t('stats.rating')}</p>
          </div>
          <div className="text-center">
            <p className="text-display font-bold text-brand-600">30+</p>
            <p className="text-body-sm text-gray-600">{t('stats.countries')}</p>
          </div>
          <div className="text-center">
            <p className="text-display font-bold text-brand-600">3min</p>
            <p className="text-body-sm text-gray-600">{t('stats.response')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
