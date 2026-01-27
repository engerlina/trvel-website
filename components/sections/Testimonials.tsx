import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 'sarah',
    rating: 5,
    location: 'Melbourne',
    destination: 'Tokyo',
    image: '/profilepics/picture_woman_07.png',
  },
  {
    id: 'james',
    rating: 5,
    location: 'Sydney',
    destination: 'Bangkok',
    image: '/profilepics/picture_man_08.png',
  },
  {
    id: 'emma',
    rating: 5,
    location: 'Brisbane',
    destination: 'Seoul',
    image: '/profilepics/picture_woman_08.png',
  },
  {
    id: 'michael',
    rating: 5,
    location: 'Perth',
    destination: 'Singapore',
    image: '/profilepics/picture_man_09.png',
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
              <div className="relative h-full bg-white rounded-2xl border border-gray-100 shadow-soft p-8 transition-all duration-300 hover:shadow-soft-lg hover:border-brand-200 hover:-translate-y-1">
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
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={t(`${testimonial.id}.name`)}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-body font-semibold text-navy-500">
                      {t(`${testimonial.id}.name`)}
                    </p>
                    <p className="text-body-sm text-gray-500">
                      {testimonial.location} → {testimonial.destination}
                    </p>
                  </div>
                </div>
              </div>
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
