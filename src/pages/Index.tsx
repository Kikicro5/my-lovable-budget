import { Link } from 'react-router-dom';
import { useBudget } from '@/hooks/useBudget';

import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthCard } from '@/components/MonthCard';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickExpenseForm } from '@/components/QuickExpenseForm';
import { TransactionList } from '@/components/TransactionList';
import { BudgetProgress } from '@/components/BudgetProgress';
import { MonthlyMiniChart } from '@/components/MonthlyMiniChart';
import { FeatureLock } from '@/components/FeatureLock';

import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle } from 'lucide-react';
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
    getAllAvailableInvestment,
    getAllAvailableSavings,
    getBudgetProgress, 
    applyRecurringTransactions,
    getActiveReminders,
    completeReminder,
    removeReminder,
    syncStatus,
    lastSyncedAt,
    groupId,
  } = useBudget();
  const { t } = useLanguage();

  const currentBudget = getCurrentBudget();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const expenseProgress = getBudgetProgress('expense');
  const investmentProgress = getBudgetProgress('investment');
  const savingsProgress = getBudgetProgress('savings');
  const activeReminders = getActiveReminders();

  const hasRecurring = state.recurringTransactions.filter(r => r.isActive).length > 0;
  const recurringApplied = currentBudget?.recurringApplied || false;
  const hasAccounts = state.accounts && state.accounts.length > 0;

  const handleAddExpense = (name: string, amount: number, category: string, accountId: string) => {
    addTransaction({ name, amount, type: 'expense', category, accountId });
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
          <MonthCard 
            month={currentMonth} 
            year={currentYear}
            activeReminders={activeReminders}
            accounts={state.accounts || []}
            onCompleteReminder={completeReminder}
            onRemoveReminder={removeReminder}
            hasRecurring={hasRecurring}
            recurringApplied={recurringApplied}
            onApplyRecurring={handleApplyRecurring}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            isInGroup={!!groupId}
          />
          
          <BalanceCard 
            balance={state.accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0} 
            income={getTotalIncome()} 
            expense={getTotalExpense()} 
            investment={getAllAvailableInvestment()} 
            savings={getAllAvailableSavings()} 
            investmentFromPrevious={0}
            accounts={state.accounts || []}
          />
          
          {hasAnyLimit && (
            <FeatureLock featureName={t('limits.title')}>
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
            </FeatureLock>
          )}
          
          
          
          {!hasAccounts ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <AlertCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('accounts.required')}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{t('accounts.requiredDescription')}</p>
                  </div>
                  <Button asChild className="gap-2">
                    <Link to="/accounts">
                      <Wallet className="w-4 h-4" />
                      {t('accounts.addFirst')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <QuickExpenseForm categories={state.savedCategories.expense} accounts={state.accounts || []} onSubmit={handleAddExpense} />
          )}
          
          <FeatureLock featureName={t('chart.title') || 'Pregled po mjesecima'}>
            <MonthlyMiniChart budgets={state.budgets} currentYear={currentYear} />
          </FeatureLock>
          
          <TransactionList title={t('transaction.lastTransactions')} transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} accounts={state.accounts || []} />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Index;