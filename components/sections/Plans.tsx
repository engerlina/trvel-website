'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Check, Zap, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Card } from '@/components/ui';
import { useDestination } from '@/contexts/DestinationContext';
import { destinations } from './Hero';

const plans = [
  {
    id: 'short',
    days: 5,
    icon: Zap,
    popular: false,
  },
  {
    id: 'week',
    days: 7,
    icon: Star,
    popular: true,
  },
  {
    id: 'extended',
    days: 15,
    icon: TrendingUp,
    popular: false,
  },
];

const features = [
  'unlimitedData',
  'instantActivation',
  'whatsappSupport',
  'moneyBackGuarantee',
];

interface PlansProps {
  prices?: {
    short: string;
    week: string;
    extended: string;
  };
  currency?: string;
  savings?: string;
}

export function Plans({
  prices = { short: '$29.99', week: '$39.99', extended: '$59.99' },
  currency = 'AUD',
  savings = '$85'
}: PlansProps) {
  const t = useTranslations('home.plans');
  const { selectedDestination, destinationName } = useDestination();

  // Find the flag component for the selected destination
  const selectedDest = destinations.find(d => d.slug === selectedDestination);
  const FlagIcon = selectedDest?.Flag;

  return (
    <section id="plans" aria-labelledby="plans-heading" className="section bg-base-100 scroll-mt-20">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          {selectedDestination ? (
            <>
              <div className="flex items-center justify-center gap-3 mb-4">
                {FlagIcon && <FlagIcon className="w-10 h-auto rounded shadow-sm" />}
                <h2 id="plans-heading" className="text-heading-xl md:text-display font-bold text-base-content">
                  {destinationName} eSIM Plans
                </h2>
              </div>
              <p className="text-body-lg text-base-content/70 max-w-2xl mx-auto">
                Choose the perfect plan for your trip to {destinationName}. All plans include unlimited data.
              </p>
            </>
          ) : (
            <>
              <h2 id="plans-heading" className="text-heading-xl md:text-display font-bold text-base-content mb-4">
                {t('title')}
              </h2>
              <p className="text-body-lg text-base-content/70 max-w-2xl mx-auto">
                {t('subtitle')}
              </p>
            </>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = prices[plan.id as keyof typeof prices];

            return (
              <Card
                key={plan.id}
                hover
                padding="none"
                className={`relative ${plan.popular ? 'border-brand-500 border-2 shadow-glow' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">
                      <Star className="w-3 h-3" />
                      {t('mostPopular')}
                    </Badge>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-brand-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-brand-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-heading font-bold text-gray-900">
                        {t(`${plan.id}.name`)}
                      </h3>
                      <p className="text-body-sm text-gray-500">
                        {plan.days} {t('days')}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-display font-bold text-gray-900">{price}</span>
                      <span className="text-body text-gray-500">{currency}</span>
                    </div>
                    <p className="text-body-sm text-gray-500 mt-1">
                      {t('unlimitedData')}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-success-600" />
                        </div>
                        <span className="text-body-sm text-gray-600">{t(`features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href="/checkout" className="block">
                    <Button
                      variant={plan.popular ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {t('selectPlan')}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Savings Callout */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-success-50 rounded-full">
            <TrendingUp className="w-5 h-5 text-success-600" />
            <p className="text-body font-medium text-success-700">
              {t('savingsCallout', { amount: savings })}
            </p>
          </div>
          <p className="text-body-sm text-gray-500 mt-4 max-w-lg mx-auto">
            {t('dataDisclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
