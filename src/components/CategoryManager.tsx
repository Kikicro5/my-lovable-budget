import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, TrendingUp, TrendingDown, LineChart, PiggyBank, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/types/budget';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/LanguageContext';

interface CategoryManagerProps {
  type: 'income' | 'expense' | 'investment' | 'savings';
  categories: Category[];
  onAdd: (category: Category) => void;
  onRemove: (categoryName: string) => void;
}

const typeConfig = {
  income: {
    icon: TrendingUp,
    titleKey: 'category.income',
    bgClass: 'bg-income',
    iconTextClass: 'text-income-foreground',
    tagClass: 'bg-income-light text-income border border-income/20',
  },
  expense: {
    icon: TrendingDown,
    titleKey: 'category.expense',
    bgClass: 'bg-expense',
    iconTextClass: 'text-expense-foreground',
    tagClass: 'bg-expense-light text-expense border border-expense/20',
  },
  investment: {
    icon: LineChart,
    titleKey: 'category.investment',
    bgClass: 'bg-primary',
    iconTextClass: 'text-primary-foreground',
    tagClass: 'bg-primary/10 text-primary border border-primary/20',
  },
  savings: {
    icon: PiggyBank,
    titleKey: 'category.savings',
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
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const config = typeConfig[type];
  const Icon = config.icon;
  const { t } = useLanguage();

  const handleAdd = () => {
    if (!newCategoryName.trim() || categories.some((c) => c.name === newCategoryName.trim())) return;
    onAdd({ 
      name: newCategoryName.trim(), 
      description: newCategoryDescription.trim() || undefined 
    });
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('p-2 rounded-lg', config.bgClass)}>
          <Icon className={cn('w-4 h-4', config.iconTextClass)} />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground">
          {t(config.titleKey)}
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        <Input
          placeholder={t('transaction.categoryName')}
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="bg-background border-border"
        />
        <div className="flex gap-2">
          <Input
            placeholder={t('transaction.categoryDesc')}
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="bg-background border-border"
          />
          <Button onClick={handleAdd} size="icon" className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {categories.map((category) => (
            <div
              key={category.name}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                config.tagClass
              )}
            >
              {category.name}
              {category.description && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 ml-1 opacity-60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{category.description}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <button
                onClick={() => onRemove(category.name)}
                className="ml-1 hover:opacity-70 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};