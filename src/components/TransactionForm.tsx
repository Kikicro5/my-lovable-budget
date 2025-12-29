import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  type: 'income' | 'expense';
  categories: string[];
  onSubmit: (name: string, amount: number, category: string) => void;
  onAddCategory: (category: string) => void;
}

export const TransactionForm = ({
  type,
  categories,
  onSubmit,
  onAddCategory,
}: TransactionFormProps) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const isIncome = type === 'income';
  const Icon = isIncome ? TrendingUp : TrendingDown;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !category) return;

    onSubmit(name.trim(), parseFloat(amount), category);
    setName('');
    setAmount('');
    setCategory('');
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory.trim());
    setCategory(newCategory.trim());
    setNewCategory('');
    setShowNewCategory(false);
  };

  return (
    <div
      className={cn(
        'rounded-xl p-5 shadow-soft animate-slide-up',
        isIncome ? 'bg-income-light border border-income/20' : 'bg-expense-light border border-expense/20'
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('p-2 rounded-lg', isIncome ? 'bg-income' : 'bg-expense')}>
          <Icon className={cn('w-4 h-4', isIncome ? 'text-income-foreground' : 'text-expense-foreground')} />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground">
          {isIncome ? 'Dodaj prihod' : 'Dodaj rashod'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder={isIncome ? 'Naziv prihoda' : 'Naziv rashoda'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-card border-border"
        />

        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Iznos (€)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-card border-border"
        />

        {showNewCategory ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nova kategorija"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
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
              onClick={() => setShowNewCategory(false)}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card border-border flex-1">
                <SelectValue placeholder="Odaberi kategoriju" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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
            isIncome
              ? 'bg-income hover:bg-income/90 text-income-foreground'
              : 'bg-expense hover:bg-expense/90 text-expense-foreground'
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj {isIncome ? 'prihod' : 'rashod'}
        </Button>
      </form>
    </div>
  );
};
