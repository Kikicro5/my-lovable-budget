import { Link } from 'react-router-dom';
import { useBudget } from '@/hooks/useBudget';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';
import { useAuth } from '@/hooks/useAuth';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ReminderIndicator } from '@/components/ReminderIndicator';
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
import { Wallet, AlertCircle, LogIn, LogOut, Repeat, Shield } from 'lucide-react';


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
    getActiveReminders,
    completeReminder,
    removeReminder,
  } = useBudget();
  const { t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const { triggerAfterAction } = useInterstitialAd();
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

  const handleAddExpense = async (name: string, amount: number, category: string, accountId: string) => {
    addTransaction({ name, amount, type: 'expense', category, accountId });
    toast({ title: t('toast.expense.added'), description: `${name}: ${amount.toLocaleString('hr-HR')} €` });
    // Trigger interstitial ad after adding expense
    await triggerAfterAction();
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
          {/* Single header row: logo, month, recurring, reminders, auth */}
          <div className="flex items-center gap-2 bg-card rounded-xl p-2.5 shadow-card animate-slide-up">
            <img src="/icon-192.png?v=2" alt="Budget Card" className="h-8 w-8 rounded-lg shrink-0" loading="lazy" />
            <h1 className="text-sm font-display font-bold text-foreground whitespace-nowrap">
              {t(`month.${currentMonth}`)} {currentYear}
            </h1>
            <div className="flex items-center gap-1 ml-auto">
              {isAdmin && (
                <Link to="/admin" className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors" title="Admin">
                  <Shield className="w-4 h-4" />
                </Link>
              )}
              <button
                className={`p-1.5 rounded-md transition-colors ${
                  hasRecurring && !recurringApplied
                    ? 'cursor-pointer hover:bg-secondary/80 text-foreground' 
                    : 'opacity-40 cursor-default text-muted-foreground'
                }`}
                onClick={hasRecurring && !recurringApplied ? handleApplyRecurring : undefined}
                title={t('recurring.apply')}
              >
                <Repeat className="w-4 h-4" />
              </button>
              <ReminderIndicator
                reminders={activeReminders}
                accounts={state.accounts || []}
                onComplete={completeReminder || (() => {})}
                onRemove={removeReminder || (() => {})}
                disabled={activeReminders.length === 0}
              />
              {user ? (
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  title={user.email || ''}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <Link to="/auth" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  <LogIn className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
          
          <BalanceCard 
            balance={state.accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0} 
            income={getTotalIncome()} 
            expense={getTotalExpense()} 
            investment={getTotalInvestment()} 
            savings={getAvailableSavings()} 
            investmentFromPrevious={getInvestmentFromPreviousPeriod()}
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