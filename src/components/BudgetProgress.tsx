import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface BudgetProgressProps {
  spent: number;
  limit: number;
  type: 'expense' | 'investment' | 'savings';
}

export const BudgetProgress = ({ spent, limit, type }: BudgetProgressProps) => {
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  
  if (limit <= 0) return null;
  
  const percentage = Math.min((spent / limit) * 100, 100);
  const remaining = limit - spent;
  const isWarning = percentage >= 80 && percentage < 100;
  const isExceeded = spent >= limit;

  const getStatusColor = () => {
    if (isExceeded) return 'text-destructive';
    if (isWarning) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getProgressColor = () => {
    if (isExceeded) return 'bg-destructive';
    if (isWarning) return 'bg-yellow-500';
    if (type === 'expense') return 'bg-expense';
    if (type === 'investment') return 'bg-primary';
    return 'bg-accent';
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft animate-fade-in border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingDown className={cn('w-4 h-4', type === 'expense' ? 'text-expense' : type === 'investment' ? 'text-primary' : 'text-accent')} />
          <span className="text-sm font-medium text-foreground">
            {t(`limits.${type}`)}
          </span>
        </div>
        {(isWarning || isExceeded) && (
          <div className={cn('flex items-center gap-1', getStatusColor())}>
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">
              {isExceeded ? t('limits.exceeded') : t('limits.warning')}
            </span>
          </div>
        )}
      </div>
      
      <div className="relative mb-2">
        <Progress 
          value={percentage} 
          className="h-3"
          style={{
            ['--progress-background' as string]: `hsl(var(--${type === 'expense' ? 'expense' : type === 'investment' ? 'primary' : 'accent'}))`,
          }}
        />
        <div 
          className={cn('absolute inset-0 h-3 rounded-full transition-all', getProgressColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-medium', getStatusColor())}>
          {t('limits.spent')}: {spent.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
        </span>
        <span className="text-muted-foreground">
          {t('limits.of')} {limit.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
        </span>
      </div>
      
      {!isExceeded && (
        <div className="mt-1 text-xs text-muted-foreground">
          {t('limits.remaining')}: {remaining.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
        </div>
      )}
    </div>
  );
};