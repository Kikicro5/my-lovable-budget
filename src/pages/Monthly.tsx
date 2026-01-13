import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthCard } from '@/components/MonthCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { CategoryManager } from '@/components/CategoryManager';
import { PreviousPeriodInput } from '@/components/PreviousPeriodInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Tags, PiggyBank, LineChart, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const Monthly = () => {
  const { state, getCurrentBudget, addTransaction, removeTransaction, addCategory, removeCategory, getPreviousMonthBalance, carryOverBalance, getAvailableInvestment, getAvailableSavings, transferFromCategory } = useBudget();
  const { t } = useLanguage();
  const currentBudget = getCurrentBudget();
  const previousBalance = getPreviousMonthBalance();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const handleAddTransaction = (type: 'income' | 'expense' | 'investment' | 'savings', name: string, amount: number, category: string) => {
    addTransaction({ name, amount, type, category });
    const toastKeys = { income: 'toast.income.added', expense: 'toast.expense.added', investment: 'toast.investment.added', savings: 'toast.savings.added' };
    toast({ title: t(toastKeys[type]), description: `${name}: ${amount.toLocaleString('hr-HR')} €` });
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

  const handleCarryOver = () => {
    const success = carryOverBalance();
    if (success) {
      toast({ title: t('toast.balance.transferred'), description: `${previousBalance.toLocaleString('hr-HR')} €` });
    } else {
      toast({ title: t('toast.balance.transferFailed'), description: t('toast.balance.alreadyTransferred'), variant: 'destructive' });
    }
  };

  const handleTransferFromInvestment = (amount: number) => {
    const success = transferFromCategory('investment', amount);
    if (success) {
      toast({ title: t('transfer.success'), description: `${amount.toLocaleString('hr-HR')} €` });
    }
  };

  const handleTransferFromSavings = (amount: number) => {
    const success = transferFromCategory('savings', amount);
    if (success) {
      toast({ title: t('transfer.success'), description: `${amount.toLocaleString('hr-HR')} €` });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="mb-4"><MonthCard month={currentMonth} year={currentYear} /></div>
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="income" className="flex items-center gap-1 text-xs px-2 text-income data-[state=active]:bg-income data-[state=active]:text-income-foreground"><TrendingUp className="w-3 h-3" /><span className="hidden sm:inline">{t('monthly.income')}</span></TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-1 text-xs px-2 text-expense data-[state=active]:bg-expense data-[state=active]:text-expense-foreground"><TrendingDown className="w-3 h-3" /><span className="hidden sm:inline">{t('monthly.expense')}</span></TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-1 text-xs px-2 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LineChart className="w-3 h-3" /><span className="hidden sm:inline">{t('monthly.investment')}</span></TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-1 text-xs px-2 text-accent data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><PiggyBank className="w-3 h-3" /><span className="hidden sm:inline">{t('monthly.savings')}</span></TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1 text-xs px-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"><Tags className="w-3 h-3" /><span className="hidden sm:inline">{t('monthly.categories')}</span></TabsTrigger>
          </TabsList>
          <TabsContent value="income" className="space-y-4">
            <TransactionForm type="income" categories={state.savedCategories.income} onSubmit={(name, amount, category) => handleAddTransaction('income', name, amount, category)} onAddCategory={(cat) => handleAddCategory('income', cat)} />
            {previousBalance !== 0 && <Button onClick={handleCarryOver} variant="outline" className="w-full flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" />{t('monthly.carryOver')} ({previousBalance.toLocaleString('hr-HR')} €)</Button>}
            <TransactionList title={t('monthly.incomeThisMonth')} transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="income" />
          </TabsContent>
          <TabsContent value="expense" className="space-y-4">
            <TransactionForm type="expense" categories={state.savedCategories.expense} onSubmit={(name, amount, category) => handleAddTransaction('expense', name, amount, category)} onAddCategory={(cat) => handleAddCategory('expense', cat)} />
            <TransactionList title={t('monthly.expenseThisMonth')} transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="expense" />
          </TabsContent>
          <TabsContent value="investment" className="space-y-4">
            <TransactionForm type="investment" categories={state.savedCategories.investment} onSubmit={(name, amount, category) => handleAddTransaction('investment', name, amount, category)} onAddCategory={(cat) => handleAddCategory('investment', cat)} availableForTransfer={getAvailableInvestment()} onTransferToBalance={handleTransferFromInvestment} />
            <PreviousPeriodInput type="investment" onSubmit={(amount) => handleAddTransactionFromPreviousPeriod('investment', amount)} />
            <TransactionList transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="investment" />
          </TabsContent>
          <TabsContent value="savings" className="space-y-4">
            <TransactionForm type="savings" categories={state.savedCategories.savings} onSubmit={(name, amount, category) => handleAddTransaction('savings', name, amount, category)} onAddCategory={(cat) => handleAddCategory('savings', cat)} availableForTransfer={getAvailableSavings()} onTransferToBalance={handleTransferFromSavings} />
            <PreviousPeriodInput type="savings" onSubmit={(amount) => handleAddTransactionFromPreviousPeriod('savings', amount)} />
            <TransactionList transactions={currentBudget?.transactions || []} onRemove={handleRemoveTransaction} filterType="savings" />
          </TabsContent>
          <TabsContent value="categories" className="space-y-4">
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