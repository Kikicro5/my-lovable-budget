import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Tags, TrendingUp, TrendingDown, LineChart, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerProps {
  type: 'income' | 'expense' | 'investment' | 'savings';
  categories: string[];
  onAdd: (category: string) => void;
  onRemove: (category: string) => void;
}

const typeConfig = {
  income: {
    icon: TrendingUp,
    title: 'Kategorije prihoda',
    bgClass: 'bg-income',
    iconTextClass: 'text-income-foreground',
    tagClass: 'bg-income-light text-income border border-income/20',
  },
  expense: {
    icon: TrendingDown,
    title: 'Kategorije rashoda',
    bgClass: 'bg-expense',
    iconTextClass: 'text-expense-foreground',
    tagClass: 'bg-expense-light text-expense border border-expense/20',
  },
  investment: {
    icon: LineChart,
    title: 'Kategorije investicija',
    bgClass: 'bg-primary',
    iconTextClass: 'text-primary-foreground',
    tagClass: 'bg-primary/10 text-primary border border-primary/20',
  },
  savings: {
    icon: PiggyBank,
    title: 'Kategorije štednje',
    bgClass: 'bg-accent',
    iconTextClass: 'text-accent-foreground',
    tagClass: 'bg-accent/10 text-accent border border-accent/20',
  },
};

export const CategoryManager = ({
  type,
  categories,
  onAdd,
  onRemove,
}: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState('');
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleAdd = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    onAdd(newCategory.trim());
    setNewCategory('');
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('p-2 rounded-lg', config.bgClass)}>
          <Icon className={cn('w-4 h-4', config.iconTextClass)} />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground">
          {config.title}
        </h3>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nova kategorija"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="bg-background border-border"
        />
        <Button onClick={handleAdd} size="icon" className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
              config.tagClass
            )}
          >
            {category}
            <button
              onClick={() => onRemove(category)}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
