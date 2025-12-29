import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerProps {
  type: 'income' | 'expense';
  categories: string[];
  onAdd: (category: string) => void;
  onRemove: (category: string) => void;
}

export const CategoryManager = ({
  type,
  categories,
  onAdd,
  onRemove,
}: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState('');
  const isIncome = type === 'income';

  const handleAdd = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    onAdd(newCategory.trim());
    setNewCategory('');
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('p-2 rounded-lg', isIncome ? 'bg-income' : 'bg-expense')}>
          <Tags className={cn('w-4 h-4', isIncome ? 'text-income-foreground' : 'text-expense-foreground')} />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground">
          Kategorije {isIncome ? 'prihoda' : 'rashoda'}
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
              isIncome
                ? 'bg-income-light text-income border border-income/20'
                : 'bg-expense-light text-expense border border-expense/20'
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
