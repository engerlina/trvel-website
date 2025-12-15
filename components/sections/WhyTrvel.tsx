import { useTranslations } from 'next-intl';
import { Clock, MessageCircle, Wifi, RefreshCw } from 'lucide-react';

const differentiators = [
  {
    id: 'guarantee',
    icon: Clock,
    color: 'brand',
  },
  {
    id: 'support',
    icon: MessageCircle,
    color: 'accent',
  },
  {
    id: 'network',
    icon: Wifi,
    color: 'success',
  },
  {
    id: 'rollover',
    icon: RefreshCw,
    color: 'brand',
  },
];

const colorClasses = {
  brand: {
    bg: 'bg-brand-100',
    icon: 'text-brand-600',
  },
  accent: {
    bg: 'bg-accent-100',
    icon: 'text-accent-600',
  },
  success: {
    bg: 'bg-success-100',
    icon: 'text-success-600',
  },
};

export function WhyTrvel() {
  const t = useTranslations('home.whyTrvel');

  return (
    <section className="section bg-gray-50">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-heading-xl md:text-display font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Differentiators Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {differentiators.map((item) => {
            const Icon = item.icon;
            const colors = colorClasses[item.color as keyof typeof colorClasses];

            return (
              <div key={item.id} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
                <h3 className="text-heading font-semibold text-gray-900 mb-2">
                  {t(`${item.id}.title`)}
                </h3>
                <p className="text-body text-gray-600">
                  {t(`${item.id}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
