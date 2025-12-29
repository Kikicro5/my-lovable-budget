import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LineChart, PiggyBank } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  investment?: number;
  savings?: number;
}

export const BalanceCard = ({ balance, income, expense, investment = 0, savings = 0 }: BalanceCardProps) => {
  const isPositive = balance >= 0;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
      <p className="text-sm text-muted-foreground font-medium mb-2 text-center">
        Trenutno stanje
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
            <p className="text-xs text-muted-foreground">Prihodi</p>
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
            <p className="text-xs text-muted-foreground">Rashodi</p>
            <p className="text-sm font-semibold text-expense">
              -{expense.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10">
          <div className="p-2 rounded-lg bg-primary">
            <LineChart className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Investicije</p>
            <p className="text-sm font-semibold text-primary">
              {investment.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10">
          <div className="p-2 rounded-lg bg-accent">
            <PiggyBank className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Štednja</p>
            <p className="text-sm font-semibold text-accent">
              {savings.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
