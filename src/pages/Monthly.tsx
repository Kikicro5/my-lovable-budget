import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthHeader } from '@/components/MonthHeader';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { CategoryManager } from '@/components/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Tags, PiggyBank, LineChart } from 'lucide-react';

const Monthly = () => {
  const {
    state,
    getCurrentBudget,
    addTransaction,
    removeTransaction,
    addCategory,
    removeCategory,
  } = useBudget();

  const currentBudget = getCurrentBudget();

  const handleAddTransaction = (
    type: 'income' | 'expense' | 'investment' | 'savings',
    name: string,
    amount: number,
    category: string
  ) => {
    addTransaction({ name, amount, type, category });
    const titles = {
      income: 'Prihod dodan',
      expense: 'Rashod dodan',
      investment: 'Investicija dodana',
      savings: 'Štednja dodana',
    };
    toast({
      title: titles[type],
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

  const handleAddCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: string) => {
    addCategory(type, category);
    toast({
      title: 'Kategorija dodana',
      description: category,
    });
  };

  const handleRemoveCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: string) => {
    removeCategory(type, category);
    toast({
      title: 'Kategorija uklonjena',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4">
        <MonthHeader month={state.currentMonth} year={state.currentYear} />

        <Tabs defaultValue="income" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="income" className="flex items-center gap-1 text-xs px-2">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Prihodi</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-1 text-xs px-2">
              <TrendingDown className="w-3 h-3" />
              <span className="hidden sm:inline">Rashodi</span>
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-1 text-xs px-2">
              <LineChart className="w-3 h-3" />
              <span className="hidden sm:inline">Investicije</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-1 text-xs px-2">
              <PiggyBank className="w-3 h-3" />
              <span className="hidden sm:inline">Štednja</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1 text-xs px-2">
              <Tags className="w-3 h-3" />
              <span className="hidden sm:inline">Kategorije</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <TransactionForm
              type="income"
              categories={state.savedCategories.income}
              onSubmit={(name, amount, category) =>
                handleAddTransaction('income', name, amount, category)
              }
              onAddCategory={(cat) => handleAddCategory('income', cat)}
            />
            <TransactionList
              title="Prihodi ovog mjeseca"
              transactions={currentBudget?.transactions || []}
              onRemove={handleRemoveTransaction}
              filterType="income"
            />
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <TransactionForm
              type="expense"
              categories={state.savedCategories.expense}
              onSubmit={(name, amount, category) =>
                handleAddTransaction('expense', name, amount, category)
              }
              onAddCategory={(cat) => handleAddCategory('expense', cat)}
            />
            <TransactionList
              title="Rashodi ovog mjeseca"
              transactions={currentBudget?.transactions || []}
              onRemove={handleRemoveTransaction}
              filterType="expense"
            />
          </TabsContent>

          <TabsContent value="investment" className="space-y-4">
            <TransactionForm
              type="investment"
              categories={state.savedCategories.investment}
              onSubmit={(name, amount, category) =>
                handleAddTransaction('investment', name, amount, category)
              }
              onAddCategory={(cat) => handleAddCategory('investment', cat)}
            />
            <TransactionList
              title="Investicije ovog mjeseca"
              transactions={currentBudget?.transactions || []}
              onRemove={handleRemoveTransaction}
              filterType="investment"
            />
          </TabsContent>

          <TabsContent value="savings" className="space-y-4">
            <TransactionForm
              type="savings"
              categories={state.savedCategories.savings}
              onSubmit={(name, amount, category) =>
                handleAddTransaction('savings', name, amount, category)
              }
              onAddCategory={(cat) => handleAddCategory('savings', cat)}
            />
            <TransactionList
              title="Štednja ovog mjeseca"
              transactions={currentBudget?.transactions || []}
              onRemove={handleRemoveTransaction}
              filterType="savings"
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManager
              type="income"
              categories={state.savedCategories.income}
              onAdd={(cat) => handleAddCategory('income', cat)}
              onRemove={(cat) => handleRemoveCategory('income', cat)}
            />
            <CategoryManager
              type="expense"
              categories={state.savedCategories.expense}
              onAdd={(cat) => handleAddCategory('expense', cat)}
              onRemove={(cat) => handleRemoveCategory('expense', cat)}
            />
            <CategoryManager
              type="investment"
              categories={state.savedCategories.investment}
              onAdd={(cat) => handleAddCategory('investment', cat)}
              onRemove={(cat) => handleRemoveCategory('investment', cat)}
            />
            <CategoryManager
              type="savings"
              categories={state.savedCategories.savings}
              onAdd={(cat) => handleAddCategory('savings', cat)}
              onRemove={(cat) => handleRemoveCategory('savings', cat)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Monthly;
