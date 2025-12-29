import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, X, LineChart, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/types/budget';
import { useLanguage } from '@/i18n/LanguageContext';

interface TransactionFormProps {
  type: 'income' | 'expense' | 'investment' | 'savings';
  categories: Category[];
  onSubmit: (name: string, amount: number, category: string) => void;
  onAddCategory: (category: Category) => void;
}

const typeConfig = {
  income: {
    icon: TrendingUp,
    titleKey: 'transaction.add.income',
    buttonTextKey: 'transaction.button.income',
    bgClass: 'bg-income-light border border-income/20',
    iconBgClass: 'bg-income',
    iconTextClass: 'text-income-foreground',
    buttonClass: 'bg-income hover:bg-income/90 text-income-foreground',
  },
  expense: {
    icon: TrendingDown,
    titleKey: 'transaction.add.expense',
    buttonTextKey: 'transaction.button.expense',
    bgClass: 'bg-expense-light border border-expense/20',
    iconBgClass: 'bg-expense',
    iconTextClass: 'text-expense-foreground',
    buttonClass: 'bg-expense hover:bg-expense/90 text-expense-foreground',
  },
  investment: {
    icon: LineChart,
    titleKey: 'transaction.add.investment',
    buttonTextKey: 'transaction.button.investment',
    bgClass: 'bg-primary/10 border border-primary/20',
    iconBgClass: 'bg-primary',
    iconTextClass: 'text-primary-foreground',
    buttonClass: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  },
  savings: {
    icon: PiggyBank,
    titleKey: 'transaction.add.savings',
    buttonTextKey: 'transaction.button.savings',
    bgClass: 'bg-accent/10 border border-accent/20',
    iconBgClass: 'bg-accent',
    iconTextClass: 'text-accent-foreground',
    buttonClass: 'bg-accent hover:bg-accent/90 text-accent-foreground',
  },
};

export const TransactionForm = ({
  type,
  categories,
  onSubmit,
  onAddCategory,
}: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const { t } = useLanguage();

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    onSubmit(category, parseFloat(amount), category);
    setAmount('');
    setCategory('');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory({ 
      name: newCategoryName.trim(), 
      description: newCategoryDescription.trim() || undefined 
    });
    setCategory(newCategoryName.trim());
    setNewCategoryName('');
    setNewCategoryDescription('');
    setShowNewCategory(false);
  };

  return (
    <div
      className={cn(
        'rounded-xl p-5 shadow-soft animate-slide-up',
        config.bgClass
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('p-2 rounded-lg', config.iconBgClass)}>
          <Icon className={cn('w-4 h-4', config.iconTextClass)} />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground">
          {t(config.titleKey)}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">

        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder={t('transaction.amount')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-card border-border"
        />

        {showNewCategory ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={t('transaction.categoryName')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-card border-border"
                autoFocus
              />
              <Button type="button" size="icon" onClick={handleAddCategory} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Input
              placeholder={t('transaction.categoryDesc')}
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              className="bg-card border-border"
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card border-border flex-1">
                <SelectValue placeholder={t('transaction.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    <div className="flex flex-col">
                      <span>{cat.name}</span>
                      {cat.description && (
                        <span className="text-xs text-muted-foreground">{cat.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowNewCategory(true)}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          type="submit"
          className={cn(
            'w-full font-semibold',
            config.buttonClass
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t(config.titleKey)}
        </Button>
      </form>
    </div>
  );
};