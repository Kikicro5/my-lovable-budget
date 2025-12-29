import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickExpenseForm } from '@/components/QuickExpenseForm';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowRightLeft } from 'lucide-react';

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
    getPreviousMonthBalance,
    carryOverBalance,
  } = useBudget();

  const currentBudget = getCurrentBudget();
  const previousBalance = getPreviousMonthBalance();

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

  const handleCarryOver = () => {
    const success = carryOverBalance();
    if (success) {
      toast({
        title: 'Stanje preneseno',
        description: `Preneseno ${previousBalance.toLocaleString('hr-HR')} € iz prethodnog mjeseca`,
      });
    } else {
      toast({
        title: 'Nije moguće prenijeti',
        description: 'Stanje je već preneseno ili nema stanja za prijenos',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="space-y-4">
          <BalanceCard
            balance={getBalance()}
            income={getTotalIncome()}
            expense={getTotalExpense()}
            investment={getTotalInvestment()}
            savings={getTotalSavings()}
            month={state.currentMonth}
            year={state.currentYear}
          />

          {previousBalance !== 0 && (
            <Button
              onClick={handleCarryOver}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Prenesi stanje iz prethodnog mjeseca ({previousBalance.toLocaleString('hr-HR')} €)
            </Button>
          )}

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
