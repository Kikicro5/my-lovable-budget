import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MonthCard } from '@/components/MonthCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { CategoryManager } from '@/components/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Tags, PiggyBank, LineChart, ArrowRightLeft } from 'lucide-react';

const Monthly = () => {
  const {
    state,
    getCurrentBudget,
    addTransaction,
    removeTransaction,
    addCategory,
    removeCategory,
    getPreviousMonthBalance,
    carryOverBalance,
  } = useBudget();

  const currentBudget = getCurrentBudget();
  const previousBalance = getPreviousMonthBalance();

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

  const handleAddCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: { name: string; description?: string }) => {
    addCategory(type, category);
    toast({
      title: 'Kategorija dodana',
      description: category.name,
    });
  };

  const handleRemoveCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: string) => {
    removeCategory(type, category);
    toast({
      title: 'Kategorija uklonjena',
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
        <div className="mb-4">
          <MonthCard month={state.currentMonth} year={state.currentYear} />
        </div>

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
