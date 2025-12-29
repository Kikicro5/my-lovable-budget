import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';
import { Category } from '@/types/budget';

interface QuickExpenseFormProps {
  categories: Category[];
  onSubmit: (name: string, amount: number, category: string) => void;
}

export const QuickExpenseForm = ({ categories, onSubmit }: QuickExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    onSubmit(category, parseFloat(amount), category);
    setAmount('');
    setCategory('');
  };

  return (
    <div className="bg-expense rounded-2xl p-5 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-expense-foreground/20">
          <Minus className="w-4 h-4 text-expense-foreground" />
        </div>
        <h3 className="text-lg font-display font-semibold text-expense-foreground">
          Brzi unos troška
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Iznos (€)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-expense-foreground/10 border-expense-foreground/20 text-expense-foreground placeholder:text-expense-foreground/60 focus:border-expense-foreground/40"
          />
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-expense-foreground/10 border-expense-foreground/20 text-expense-foreground">
              <SelectValue placeholder="Kategorija" />
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
        </div>
        
        <Button
          type="submit"
          className="w-full bg-expense-foreground text-expense hover:bg-expense-foreground/90 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj trošak
        </Button>
      </form>
    </div>
  );
};
