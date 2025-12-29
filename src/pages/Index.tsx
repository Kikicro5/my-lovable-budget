import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthCard } from '@/components/MonthCard';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickExpenseForm } from '@/components/QuickExpenseForm';
import { TransactionList } from '@/components/TransactionList';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const {
    state,
    getCurrentBudget,
    addTransaction,
    removeTransaction,
    getBalance,
    getTotalIncome,
    getTotalExpense,
    getTotalInvestment,
    getTotalSavings,
  } = useBudget();

  const currentBudget = getCurrentBudget();

  const handleAddExpense = (name: string, amount: number, category: string) => {
    addTransaction({ name, amount, type: 'expense', category });
    toast({
      title: 'Trošak dodan',
      description: `${name}: ${amount.toLocaleString('hr-HR')} €`,
    });
  };

  const handleRemoveTransaction = (id: string) => {
    removeTransaction(id);
    toast({
      title: 'Transakcija uklonjena',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="space-y-4">
          <MonthCard month={state.currentMonth} year={state.currentYear} />
          
          <BalanceCard
            balance={getBalance()}
            income={getTotalIncome()}
            expense={getTotalExpense()}
            investment={getTotalInvestment()}
            savings={getTotalSavings()}
          />

          <QuickExpenseForm
            categories={state.savedCategories.expense}
            onSubmit={handleAddExpense}
          />

          <TransactionList
            title="Posljednje transakcije"
            transactions={currentBudget?.transactions || []}
            onRemove={handleRemoveTransaction}
          />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
