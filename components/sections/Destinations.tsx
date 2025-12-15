import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';

const popularDestinations = [
  { name: 'Japan', slug: 'japan', flag: '🇯🇵', fromPrice: '$29.99' },
  { name: 'Thailand', slug: 'thailand', flag: '🇹🇭', fromPrice: '$24.99' },
  { name: 'South Korea', slug: 'south-korea', flag: '🇰🇷', fromPrice: '$29.99' },
  { name: 'Singapore', slug: 'singapore', flag: '🇸🇬', fromPrice: '$19.99' },
  { name: 'Indonesia', slug: 'indonesia', flag: '🇮🇩', fromPrice: '$19.99' },
  { name: 'Vietnam', slug: 'vietnam', flag: '🇻🇳', fromPrice: '$19.99' },
  { name: 'Malaysia', slug: 'malaysia', flag: '🇲🇾', fromPrice: '$19.99' },
  { name: 'United Kingdom', slug: 'united-kingdom', flag: '🇬🇧', fromPrice: '$34.99' },
];

export function Destinations() {
  const t = useTranslations('home.destinations');

  return (
    <section className="section bg-gray-50">
      <div className="container-wide">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-heading-xl md:text-display font-bold text-gray-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-body-lg text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/destinations" className="shrink-0">
            <Button variant="ghost" size="md">
              {t('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {popularDestinations.map((destination) => (
            <Link key={destination.slug} href={`/${destination.slug}`}>
              <Card hover padding="none" className="group overflow-hidden">
                <div className="p-6">
                  {/* Flag */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {destination.flag}
                  </div>

                  {/* Info */}
                  <h3 className="text-heading font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-body-sm text-gray-500">
                    {t('from')} <span className="font-semibold text-brand-600">{destination.fromPrice}</span>
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-body-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('viewPlans')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
