import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LineChart, PiggyBank } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { TransferFromCategoryDialog } from './TransferFromCategoryDialog';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  investment?: number;
  savings?: number;
  investmentFromPrevious?: number;
  savingsFromPrevious?: number;
  availableInvestment?: number;
  availableSavings?: number;
  onTransferFromInvestment?: (amount: number) => void;
  onTransferFromSavings?: (amount: number) => void;
}

export const BalanceCard = ({ 
  balance, 
  income, 
  expense, 
  investment = 0, 
  savings = 0, 
  investmentFromPrevious = 0, 
  savingsFromPrevious = 0,
  availableInvestment = 0,
  availableSavings = 0,
  onTransferFromInvestment,
  onTransferFromSavings,
}: BalanceCardProps) => {
  const isPositive = balance >= 0;
  const totalInvestment = investment + investmentFromPrevious;
  const totalSavings = savings + savingsFromPrevious;
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
      <p className="text-sm text-muted-foreground font-medium mb-2 text-center">
        {t('balance.current')}
      </p>
      <h2
        className={cn(
          'text-4xl font-display font-bold mb-6 text-center',
          isPositive ? 'text-income' : 'text-expense'
        )}
      >
        {balance.toLocaleString('hr-HR', {
          style: 'currency',
          currency: 'EUR',
        })}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-income-light">
          <div className="p-2 rounded-lg bg-income">
            <TrendingUp className="w-4 h-4 text-income-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('balance.income')}</p>
            <p className="text-sm font-semibold text-income">
              +{income.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
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
              -{expense.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3 rounded-xl bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <LineChart className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('balance.investment')}</p>
              <p className="text-sm font-semibold text-primary">
                {totalInvestment.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
          </div>
          {onTransferFromInvestment && availableInvestment > 0 && (
            <TransferFromCategoryDialog
              type="investment"
              availableAmount={availableInvestment}
              onTransfer={onTransferFromInvestment}
            />
          )}
        </div>

        <div className="flex flex-col gap-2 p-3 rounded-xl bg-accent/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <PiggyBank className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('balance.savings')}</p>
              <p className="text-sm font-semibold text-accent">
                {totalSavings.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
          </div>
          {onTransferFromSavings && availableSavings > 0 && (
            <TransferFromCategoryDialog
              type="savings"
              availableAmount={availableSavings}
              onTransfer={onTransferFromSavings}
            />
          )}
        </div>
      </div>
    </div>
  );
};