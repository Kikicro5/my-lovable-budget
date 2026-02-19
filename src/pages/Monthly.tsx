import { Link } from 'react-router-dom';
import { useBudget } from '@/hooks/useBudget';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthCard } from '@/components/MonthCard';
import { TransactionForm } from '@/components/TransactionForm';
import { RecurringTransactionsManager } from '@/components/RecurringTransactionsManager';
import { TransactionList } from '@/components/TransactionList';
import { CategoryManager } from '@/components/CategoryManager';
import { PreviousPeriodInput } from '@/components/PreviousPeriodInput';
import { FeatureLock } from '@/components/FeatureLock';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Tags, PiggyBank, LineChart, Wallet, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';


const Monthly = () => {
  const { state, getCurrentBudget, addTransaction, removeTransaction, addCategory, removeCategory, getAvailableInvestment, getAvailableSavings, transferFromCategory } = useBudget();
  const { t } = useLanguage();
  const { triggerAfterAction } = useInterstitialAd();
  const currentBudget = getCurrentBudget();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Check if user has any accounts
  const hasAccounts = state.accounts && state.accounts.length > 0;

  // Component to show when no accounts exist
  const NoAccountsPrompt = () => (
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
  );

  const handleAddTransaction = async (type: 'income' | 'expense' | 'investment' | 'savings', name: string, amount: number, category: string, date: Date, accountId?: string) => {
    addTransaction({ name, amount, type, category, date: date.toISOString(), accountId });
    const toastKeys = { income: 'toast.income.added', expense: 'toast.expense.added', investment: 'toast.investment.added', savings: 'toast.savings.added' };
    toast({ title: t(toastKeys[type]), description: `${name}: ${amount.toLocaleString('hr-HR')} €` });
    // Trigger interstitial ad after adding transaction
    await triggerAfterAction();
  };

  const handleAddTransactionFromPreviousPeriod = (type: 'investment' | 'savings', amount: number) => {
    addTransaction({ name: t('monthly.fromPreviousPeriod'), amount, type, category: t('monthly.fromPreviousPeriod'), isFromPreviousPeriod: true });
    toast({ title: t(type === 'investment' ? 'toast.investment.added' : 'toast.savings.added'), description: `${t('monthly.fromPreviousPeriod')}: ${amount.toLocaleString('hr-HR')} €` });
  };

  const handleRemoveTransaction = (id: string) => {
    removeTransaction(id);
    toast({ title: t('toast.transaction.removed'), variant: 'destructive' });
  };

  const handleAddCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: { name: string; description?: string }) => {
    addCategory(type, category);
    toast({ title: t('toast.category.added'), description: category.name });
  };

  const handleRemoveCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: string) => {
    removeCategory(type, category);
    toast({ title: t('toast.category.removed'), variant: 'destructive' });
  };

  const handleTransferFromInvestment = (amount: number, accountId: string) => {
    const success = transferFromCategory('investment', amount, accountId);
    if (success) {
      toast({ title: t('transfer.success'), description: `${amount.toLocaleString('hr-HR')} €` });
    }
  };

  const handleTransferFromSavings = (amount: number, accountId: string) => {
    const success = transferFromCategory('savings', amount, accountId);
    if (success) {
      toast({ title: t('transfer.success'), description: `${amount.toLocaleString('hr-HR')} €` });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="mb-4"><MonthCard month={currentMonth} year={currentYear} /></div>
        
        <Tabs defaultValue="income" className="w-full mt-4">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="income" className="flex items-center gap-1 text-xs px-2 text-income data-[state=active]:bg-income data-[state=active]:text-income-foreground"><TrendingUp className="w-5 h-5" /><span className="hidden sm:inline">{t('monthly.income')}</span></TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-1 text-xs px-2 text-expense data-[state=active]:bg-expense data-[state=active]:text-expense-foreground"><TrendingDown className="w-5 h-5" /><span className="hidden sm:inline">{t('monthly.expense')}</span></TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-1 text-xs px-2 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LineChart className="w-5 h-5" /><span className="hidden sm:inline">{t('monthly.investment')}</span></TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-1 text-xs px-2 text-accent data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><PiggyBank className="w-5 h-5" /><span className="hidden sm:inline">{t('monthly.savings')}</span></TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1 text-xs px-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"><Tags className="w-5 h-5" /><span className="hidden sm:inline">{t('monthly.categories')}</span></TabsTrigger>
          </TabsList>
          <TabsContent value="income" className="space-y-4">
            {!hasAccounts ? (
              <NoAccountsPrompt />
            ) : (
              <TransactionForm type="income" categories={state.savedCategories.income} accounts={state.accounts || []} onSubmit={(name, amount, category, date, accountId) => handleAddTransaction('income', name, amount, category, date, accountId)} onAddCategory={(cat) => handleAddCategory('income', cat)} />
            )}
            <TransactionList title={t('monthly.incomeThisMonth')} transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="income" accounts={state.accounts || []} />
          </TabsContent>
          <TabsContent value="expense" className="space-y-4">
            {!hasAccounts ? (
              <NoAccountsPrompt />
            ) : (
              <TransactionForm type="expense" categories={state.savedCategories.expense} accounts={state.accounts || []} onSubmit={(name, amount, category, date, accountId) => handleAddTransaction('expense', name, amount, category, date, accountId)} onAddCategory={(cat) => handleAddCategory('expense', cat)} />
            )}
            <TransactionList title={t('monthly.expenseThisMonth')} transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="expense" accounts={state.accounts || []} />
          </TabsContent>
          <TabsContent value="investment" className="space-y-4">
            <FeatureLock featureName={t('monthly.investment')}>
              {!hasAccounts ? (
                <NoAccountsPrompt />
              ) : (
                <>
                  <TransactionForm type="investment" categories={state.savedCategories.investment} accounts={state.accounts || []} onSubmit={(name, amount, category, date, accountId) => handleAddTransaction('investment', name, amount, category, date, accountId)} onAddCategory={(cat) => handleAddCategory('investment', cat)} availableForTransfer={getAvailableInvestment()} onTransferToBalance={handleTransferFromInvestment} />
                  <PreviousPeriodInput type="investment" onSubmit={(amount) => handleAddTransactionFromPreviousPeriod('investment', amount)} />
                </>
              )}
              <TransactionList transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="investment" accounts={state.accounts || []} />
            </FeatureLock>
          </TabsContent>
          <TabsContent value="savings" className="space-y-4">
            <FeatureLock featureName={t('monthly.savings')}>
              {!hasAccounts ? (
                <NoAccountsPrompt />
              ) : (
                <>
                  <TransactionForm type="savings" categories={state.savedCategories.savings} accounts={state.accounts || []} onSubmit={(name, amount, category, date, accountId) => handleAddTransaction('savings', name, amount, category, date, accountId)} onAddCategory={(cat) => handleAddCategory('savings', cat)} availableForTransfer={getAvailableSavings()} onTransferToBalance={handleTransferFromSavings} />
                  <PreviousPeriodInput type="savings" onSubmit={(amount) => handleAddTransactionFromPreviousPeriod('savings', amount)} />
                </>
              )}
              <TransactionList transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="savings" accounts={state.accounts || []} />
            </FeatureLock>
          </TabsContent>
          <TabsContent value="categories" className="space-y-4">
            <RecurringTransactionsManager />
            <CategoryManager type="income" categories={state.savedCategories.income} onAdd={(cat) => handleAddCategory('income', cat)} onRemove={(cat) => handleRemoveCategory('income', cat)} />
            <CategoryManager type="expense" categories={state.savedCategories.expense} onAdd={(cat) => handleAddCategory('expense', cat)} onRemove={(cat) => handleRemoveCategory('expense', cat)} />
            <CategoryManager type="investment" categories={state.savedCategories.investment} onAdd={(cat) => handleAddCategory('investment', cat)} onRemove={(cat) => handleRemoveCategory('investment', cat)} />
            <CategoryManager type="savings" categories={state.savedCategories.savings} onAdd={(cat) => handleAddCategory('savings', cat)} onRemove={(cat) => handleRemoveCategory('savings', cat)} />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Monthly;