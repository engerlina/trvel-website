import { useTranslations } from 'next-intl';
import { Check, X, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';

interface ComparisonRow {
  feature: string;
  trvel: string | boolean;
  competitor: string | boolean;
}

interface ComparisonProps {
  competitorName?: string;
  savings?: string;
}

export function Comparison({ competitorName = 'Telstra', savings = '$70+' }: ComparisonProps) {
  const t = useTranslations('home.comparison');

  const comparisonData: ComparisonRow[] = [
    { feature: 'dailyCost', trvel: '$5.71/day', competitor: '$10/day' },
    { feature: 'data', trvel: true, competitor: '200MB/day' },
    { feature: 'support', trvel: true, competitor: false },
    { feature: 'setup', trvel: '2 minutes', competitor: 'Auto-roam' },
    { feature: 'guarantee', trvel: true, competitor: false },
  ];

  const renderValue = (value: string | boolean, isPositive: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-success-600" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      );
    }
    return (
      <span className={`text-body font-medium ${isPositive ? 'text-gray-900' : 'text-gray-500'}`}>
        {value}
      </span>
    );
  };

  return (
    <section className="section bg-white">
      <div className="container-tight">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading-xl md:text-display font-bold text-gray-900 mb-4">
            {t('title', { competitor: competitorName })}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle', { competitor: competitorName })}
          </p>
        </div>

        {/* Comparison Table */}
        <Card padding="none" className="overflow-hidden mb-8">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
            <div className="p-4 md:p-6">
              <span className="text-body-sm font-medium text-gray-500 uppercase tracking-wide">
                {t('feature')}
              </span>
            </div>
            <div className="p-4 md:p-6 text-center border-l border-gray-100 bg-brand-50">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">T</span>
                </div>
                <span className="text-body font-bold text-brand-700">Trvel</span>
              </div>
            </div>
            <div className="p-4 md:p-6 text-center border-l border-gray-100">
              <span className="text-body font-medium text-gray-600">{competitorName}</span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 ${index !== comparisonData.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="p-4 md:p-6 flex items-center">
                <span className="text-body text-gray-700">{t(`features.${row.feature}`)}</span>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-l border-gray-100 bg-brand-50/50">
                {renderValue(row.trvel, true)}
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-l border-gray-100">
                {renderValue(row.competitor, false)}
              </div>
            </div>
          ))}
        </Card>

        {/* Savings Highlight */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-success-50 to-brand-50 rounded-2xl border border-success-200">
            <TrendingUp className="w-8 h-8 text-success-600" />
            <div className="text-left">
              <p className="text-body-sm text-gray-600">{t('savingsLabel')}</p>
              <p className="text-heading-lg font-bold text-success-700">{savings}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
