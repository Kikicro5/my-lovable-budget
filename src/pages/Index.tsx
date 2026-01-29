import { useEffect } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthCard } from '@/components/MonthCard';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickExpenseForm } from '@/components/QuickExpenseForm';
import { TransactionList } from '@/components/TransactionList';
import { BudgetProgress } from '@/components/BudgetProgress';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';

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
    getInvestmentFromPreviousPeriod, 
    getAvailableSavings,
    getBudgetProgress, 
    applyRecurringTransactions, 
    autoCarryOverAmount, 
    clearAutoCarryOverAmount,
  } = useBudget();
  const { t } = useLanguage();
  const currentBudget = getCurrentBudget();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const expenseProgress = getBudgetProgress('expense');
  const investmentProgress = getBudgetProgress('investment');
  const savingsProgress = getBudgetProgress('savings');

  const hasRecurring = state.recurringTransactions.filter(r => r.isActive).length > 0;
  const recurringApplied = currentBudget?.recurringApplied || false;

  // Show notification when auto carry-over happens
  useEffect(() => {
    if (autoCarryOverAmount !== null) {
      toast({ 
        title: t('toast.balance.autoTransferred'), 
        description: `${Math.abs(autoCarryOverAmount).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €` 
      });
      clearAutoCarryOverAmount();
    }
  }, [autoCarryOverAmount, clearAutoCarryOverAmount, t]);

  const handleAddExpense = (name: string, amount: number, category: string) => {
    addTransaction({ name, amount, type: 'expense', category });
    toast({ title: t('toast.expense.added'), description: `${name}: ${amount.toLocaleString('hr-HR')} €` });
  };

  const handleRemoveTransaction = (id: string) => {
    removeTransaction(id);
    toast({ title: t('toast.transaction.removed'), variant: 'destructive' });
  };

  const handleApplyRecurring = () => {
    const applied = applyRecurringTransactions();
    if (applied) {
      toast({ title: t('recurring.applied') });
    } else {
      toast({ title: t('recurring.alreadyApplied'), variant: 'destructive' });
    }
  };

  const hasAnyLimit = expenseProgress.limit > 0 || investmentProgress.limit > 0 || savingsProgress.limit > 0;

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <MonthCard month={currentMonth} year={currentYear} />
            </div>
            {hasRecurring && !recurringApplied && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleApplyRecurring}>
                <Repeat className="w-4 h-4" />
                {t('recurring.apply')}
              </Button>
            )}
          </div>
          
          <BalanceCard 
            balance={getBalance()} 
            income={getTotalIncome()} 
            expense={getTotalExpense()} 
            investment={getTotalInvestment()} 
            savings={getAvailableSavings()} 
            investmentFromPrevious={getInvestmentFromPreviousPeriod()} 
          />
          
          {hasAnyLimit && (
            <div className="space-y-3">
              {expenseProgress.limit > 0 && (
                <BudgetProgress spent={expenseProgress.spent} limit={expenseProgress.limit} type="expense" />
              )}
              {investmentProgress.limit > 0 && (
                <BudgetProgress spent={investmentProgress.spent} limit={investmentProgress.limit} type="investment" />
              )}
              {savingsProgress.limit > 0 && (
                <BudgetProgress spent={savingsProgress.spent} limit={savingsProgress.limit} type="savings" />
              )}
            </div>
          )}
          
          <QuickExpenseForm categories={state.savedCategories.expense} onSubmit={handleAddExpense} />
          <TransactionList title={t('transaction.lastTransactions')} transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} accounts={state.accounts || []} />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Index;