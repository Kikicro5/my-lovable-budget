import { Transaction } from '@/types/budget';
import { Trash2, TrendingUp, TrendingDown, LineChart, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TransactionListProps {
  transactions: Transaction[];
  onRemove: (id: string) => void;
  title?: string;
  filterType?: 'income' | 'expense' | 'investment' | 'savings';
}

const typeConfig = {
  income: {
    icon: TrendingUp,
    bgClass: 'bg-income-light hover:bg-income-light/80',
    iconBgClass: 'bg-income',
    iconTextClass: 'text-income-foreground',
    amountClass: 'text-income',
    prefix: '+',
  },
  expense: {
    icon: TrendingDown,
    bgClass: 'bg-expense-light hover:bg-expense-light/80',
    iconBgClass: 'bg-expense',
    iconTextClass: 'text-expense-foreground',
    amountClass: 'text-expense',
    prefix: '-',
  },
  investment: {
    icon: LineChart,
    bgClass: 'bg-primary/10 hover:bg-primary/15',
    iconBgClass: 'bg-primary',
    iconTextClass: 'text-primary-foreground',
    amountClass: 'text-primary',
    prefix: '',
  },
  savings: {
    icon: PiggyBank,
    bgClass: 'bg-accent/10 hover:bg-accent/15',
    iconBgClass: 'bg-accent',
    iconTextClass: 'text-accent-foreground',
    amountClass: 'text-accent',
    prefix: '',
  },
};

export const TransactionList = ({
  transactions,
  onRemove,
  title,
  filterType,
}: TransactionListProps) => {
  const { t } = useLanguage();
  
  // Filter out withdrawal transactions (they are internal, only show the income side)
  const baseTransactions = transactions.filter((t) => !t.isWithdrawal);
  
  const filteredTransactions = filterType
    ? baseTransactions.filter((t) => t.type === filterType)
    : baseTransactions;

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 text-center animate-fade-in">
        {title && (
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            {title}
          </h3>
        )}
        <p className="text-muted-foreground">{t('transaction.noTransactions')}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft animate-fade-in">
      {title && (
        <h3 className="text-lg font-display font-semibold text-foreground mb-4 px-2">
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {sortedTransactions.map((transaction) => {
          const config = typeConfig[transaction.type];
          const Icon = config.icon;
          
          return (
            <div
              key={transaction.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg transition-colors',
                config.bgClass
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', config.iconBgClass)}>
                  <Icon className={cn('w-4 h-4', config.iconTextClass)} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.name}</p>
                  <p className="text-xs text-muted-foreground">{transaction.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('font-semibold', config.amountClass)}>
                  {config.prefix}
                  {transaction.amount.toLocaleString('hr-HR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  €
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('dialog.confirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('dialog.deleteTransaction')} "{transaction.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemove(transaction.id)}>
                        {t('dialog.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};