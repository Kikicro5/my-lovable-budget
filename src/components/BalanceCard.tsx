import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LineChart, PiggyBank, Wallet } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Account } from '@/types/budget';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  investment?: number;
  savings?: number;
  investmentFromPrevious?: number;
  accounts?: Account[];
}

export const BalanceCard = ({ 
  balance, 
  income, 
  expense, 
  investment = 0, 
  savings = 0, 
  investmentFromPrevious = 0,
  accounts = [],
}: BalanceCardProps) => {
  const isPositive = balance >= 0;
  const totalInvestment = investment + investmentFromPrevious;
  const { t } = useLanguage();
  const { formatAmount, currencySymbol } = useCurrency();

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium mb-1">
            {t('balance.current')}
          </p>
          <h2
            className={cn(
              'text-2xl font-display font-bold',
              isPositive ? 'text-income' : 'text-expense'
            )}
          >
            {formatAmount(balance)}
          </h2>
        </div>
        
        {accounts.length > 0 && (
          <div className="flex-1 text-right">
            <div className="space-y-1">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">{account.name}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {account.balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-income-light">
          <div className="p-2 rounded-lg bg-income">
            <TrendingUp className="w-4 h-4 text-income-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('balance.income')}</p>
            <p className="text-sm font-semibold text-income">
              +{income.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-expense-light">
          <div className="p-2 rounded-lg bg-expense">
            <TrendingDown className="w-4 h-4 text-expense-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('balance.expense')}</p>
            <p className="text-sm font-semibold text-expense">
              -{expense.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10">
          <div className="p-2 rounded-lg bg-primary">
            <LineChart className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('balance.investment')}</p>
            <p className="text-sm font-semibold text-primary">
              {totalInvestment.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10">
          <div className="p-2 rounded-lg bg-accent">
            <PiggyBank className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('balance.savings')}</p>
            <p className="text-sm font-semibold text-accent">
              {savings.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};