import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShoppingCart, Plane, Wifi, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

const steps = [
  {
    id: 'buy',
    icon: ShoppingCart,
    time: '2 min',
  },
  {
    id: 'land',
    icon: Plane,
    time: 'Instant',
  },
  {
    id: 'connect',
    icon: Wifi,
    time: 'Always',
  },
];

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  return (
    <section aria-labelledby="how-it-works-heading" className="section bg-gray-50">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 id="how-it-works-heading" className="text-heading-xl md:text-display font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative text-center">
                  {/* Step Number */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-600 text-white text-body-sm font-bold flex items-center justify-center z-10">
                    {index + 1}
                  </div>

                  {/* Icon Circle */}
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-brand-100 flex items-center justify-center mx-auto mb-6 shadow-soft relative">
                    <Icon className="w-12 h-12 text-brand-600" />
                  </div>

                  {/* Content */}
                  <div className="px-4">
                    <div className="inline-block px-3 py-1 bg-brand-100 rounded-full text-body-sm font-medium text-brand-700 mb-3">
                      {step.time}
                    </div>
                    <h3 className="text-heading font-bold text-gray-900 mb-2">
                      {t(`${step.id}.title`)}
                    </h3>
                    <p className="text-body text-gray-600">
                      {t(`${step.id}.description`)}
                    </p>
                  </div>

                  {/* Arrow (Mobile) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6">
                      <ArrowRight className="w-6 h-6 text-brand-400 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/how-it-works">
            <Button variant="secondary" size="lg">
              {t('cta')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
