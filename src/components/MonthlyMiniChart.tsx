import { useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { MonthlyBudget } from '@/types/budget';

interface MonthlyMiniChartProps {
  budgets: MonthlyBudget[];
  currentYear: number;
}

const monthNames = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];

export const MonthlyMiniChart = ({ budgets, currentYear }: MonthlyMiniChartProps) => {
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();

  const chartData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: 12 }, (_, i) => {
      const budget = budgets.find(b => b.month === i && b.year === currentYear);
      const expenses = budget?.transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      return {
        month: monthNames[i],
        expenses,
        isCurrent: i === currentMonth,
      };
    });
  }, [budgets, currentYear]);

  const maxExpense = Math.max(...chartData.map(d => d.expenses), 1);

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('chart.yearlyExpenses')} {currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                interval={0}
              />
              <Bar 
                dataKey="expenses" 
                radius={[2, 2, 0, 0]}
                maxBarSize={20}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
