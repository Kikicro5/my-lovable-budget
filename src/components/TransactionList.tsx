import { Transaction } from '@/types/budget';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onRemove: (id: string) => void;
  title?: string;
  filterType?: 'income' | 'expense';
}

export const TransactionList = ({
  transactions,
  onRemove,
  title,
  filterType,
}: TransactionListProps) => {
  const filteredTransactions = filterType
    ? transactions.filter((t) => t.type === filterType)
    : transactions;

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
        <p className="text-muted-foreground">Nema transakcija</p>
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
        {sortedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg transition-colors',
              transaction.type === 'income'
                ? 'bg-income-light hover:bg-income-light/80'
                : 'bg-expense-light hover:bg-expense-light/80'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  transaction.type === 'income' ? 'bg-income' : 'bg-expense'
                )}
              >
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-4 h-4 text-income-foreground" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-expense-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{transaction.name}</p>
                <p className="text-xs text-muted-foreground">{transaction.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-semibold',
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.amount.toLocaleString('hr-HR', {
                  minimumFractionDigits: 2,
                })}{' '}
                €
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(transaction.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
