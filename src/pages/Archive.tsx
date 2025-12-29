import { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyBudget } from '@/types/budget';
import { Calendar, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const monthNames = [
  'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
  'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
];

const Archive = () => {
  const { getPastBudgets, getBalance, getTotalIncome, getTotalExpense, removeTransaction } = useBudget();
  const [selectedBudget, setSelectedBudget] = useState<MonthlyBudget | null>(null);

  const pastBudgets = getPastBudgets();

  if (selectedBudget) {
    const balance = getBalance(selectedBudget);
    const income = getTotalIncome(selectedBudget);
    const expense = getTotalExpense(selectedBudget);

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <button
            onClick={() => setSelectedBudget(null)}
            className="flex items-center gap-2 text-primary font-medium mb-6 hover:opacity-80 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Natrag na arhivu
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {monthNames[selectedBudget.month]} {selectedBudget.year}
            </h1>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-soft mb-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Prihodi</p>
                <p className="text-lg font-semibold text-income">
                  +{income.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rashodi</p>
                <p className="text-lg font-semibold text-expense">
                  -{expense.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stanje</p>
                <p className={cn('text-lg font-semibold', balance >= 0 ? 'text-income' : 'text-expense')}>
                  {balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
            </div>
          </div>

          <TransactionList
            title="Sve transakcije"
            transactions={selectedBudget.transactions}
            onRemove={removeTransaction}
          />
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Arhiva</h1>
            <p className="text-muted-foreground text-sm">Pregledaj prošle mjesece</p>
          </div>
        </div>

        {pastBudgets.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-soft animate-fade-in">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              Nema arhiviranih mjeseci
            </h3>
            <p className="text-muted-foreground">
              Prošli mjeseci će se automatski pojaviti ovdje
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastBudgets.map((budget) => {
              const balance = getBalance(budget);
              const income = getTotalIncome(budget);
              const expense = getTotalExpense(budget);

              return (
                <button
                  key={budget.id}
                  onClick={() => setSelectedBudget(budget)}
                  className="w-full bg-card rounded-xl p-4 shadow-soft hover:shadow-card transition-all duration-200 text-left animate-slide-up"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-foreground">
                      {monthNames[budget.month]} {budget.year}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-income-light">
                        <TrendingUp className="w-3 h-3 text-income" />
                      </div>
                      <span className="text-sm text-income font-medium">
                        +{income.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} €
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-expense-light">
                        <TrendingDown className="w-3 h-3 text-expense" />
                      </div>
                      <span className="text-sm text-expense font-medium">
                        -{expense.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} €
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={cn('p-1.5 rounded-lg', balance >= 0 ? 'bg-income-light' : 'bg-expense-light')}>
                        <Wallet className={cn('w-3 h-3', balance >= 0 ? 'text-income' : 'text-expense')} />
                      </div>
                      <span className={cn('text-sm font-medium', balance >= 0 ? 'text-income' : 'text-expense')}>
                        {balance.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} €
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Archive;
