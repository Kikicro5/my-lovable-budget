import { useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { MonthlyBudget } from '@/types/budget';

interface MonthlyMiniChartProps {
  budgets: MonthlyBudget[];
  currentYear: number;
}

export const MonthlyMiniChart = ({ budgets, currentYear }: MonthlyMiniChartProps) => {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const budget = budgets.find(b => b.month === i && b.year === currentYear);
      const expenses = budget?.transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const income = budget?.transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      return {
        month: t(`chart.month.${i}`),
        income,
        expenses,
      };
    });
  }, [budgets, currentYear, t]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('chart.yearlyOverview')} {currentYear}
          </CardTitle>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="text-muted-foreground">{t('chart.income')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span className="text-muted-foreground">{t('chart.expenses')}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={-1} barCategoryGap="20%">
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                interval={0}
              />
              <Bar 
                dataKey="income" 
                fill="#3b82f6"
                radius={[2, 0, 0, 0]}
                maxBarSize={12}
                name={t('chart.income')}
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444"
                radius={[0, 2, 0, 0]}
                maxBarSize={12}
                name={t('chart.expenses')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
