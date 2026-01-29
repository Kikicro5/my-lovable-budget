import { useState } from 'react';
import { Repeat, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBudget } from '@/hooks/useBudget';
import { useLanguage } from '@/i18n/LanguageContext';
import { RecurringTransaction } from '@/types/budget';
import { cn } from '@/lib/utils';

export const RecurringTransactionsManager = () => {
  const { state, addRecurringTransaction, removeRecurringTransaction, toggleRecurringTransaction, updateRecurringTransaction } = useBudget();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'investment' | 'savings'>('expense');
  const [category, setCategory] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense' | 'investment' | 'savings'>('expense');
  const [editCategory, setEditCategory] = useState('');

  const categories = state.savedCategories[type];
  const editCategories = state.savedCategories[editType];

  const handleAdd = () => {
    if (!amount || !category) return;
    
    addRecurringTransaction({
      name: category,
      amount: parseFloat(amount),
      type,
      category,
    });
    
    setAmount('');
    setCategory('');
  };

  const handleStartEdit = (rt: RecurringTransaction) => {
    setEditingId(rt.id);
    setEditAmount(rt.amount.toString());
    setEditType(rt.type);
    setEditCategory(rt.category);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditType('expense');
    setEditCategory('');
  };

  const handleSaveEdit = () => {
    if (!editingId || !editAmount || !editCategory) return;
    
    updateRecurringTransaction(editingId, {
      name: editCategory,
      amount: parseFloat(editAmount),
      type: editType,
      category: editCategory,
    });
    
    handleCancelEdit();
  };

  const getTypeColor = (transactionType: string) => {
    switch (transactionType) {
      case 'income': return 'bg-income-light text-income border border-income/20';
      case 'expense': return 'bg-expense-light text-expense border border-expense/20';
      case 'investment': return 'bg-primary/10 text-primary border border-primary/20';
      case 'savings': return 'bg-accent/10 text-accent border border-accent/20';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-secondary">
          <Repeat className="w-4 h-4 text-secondary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            {t('recurring.title')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('recurring.description')}
          </p>
        </div>
      </div>

      {/* Add new recurring transaction */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <Select value={type} onValueChange={(v: typeof type) => { setType(v); setCategory(''); }}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">{t('monthly.income')}</SelectItem>
              <SelectItem value="expense">{t('monthly.expense')}</SelectItem>
              <SelectItem value="investment">{t('monthly.investment')}</SelectItem>
              <SelectItem value="savings">{t('monthly.savings')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={t('transaction.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t('transaction.amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="bg-background border-border"
          />
          <Button onClick={handleAdd} size="icon" className="shrink-0" disabled={!amount || !category}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* List of recurring transactions */}
      {state.recurringTransactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t('recurring.empty')}
        </p>
      ) : (
        <div className="space-y-2">
          {state.recurringTransactions.map((rt) => (
            <div
              key={rt.id}
              className={cn(
                'p-3 rounded-lg border',
                rt.isActive ? 'bg-background' : 'bg-muted/30 opacity-60'
              )}
            >
              {editingId === rt.id ? (
                // Edit mode
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={editType} onValueChange={(v: typeof editType) => { setEditType(v); setEditCategory(''); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">{t('monthly.income')}</SelectItem>
                        <SelectItem value="expense">{t('monthly.expense')}</SelectItem>
                        <SelectItem value="investment">{t('monthly.investment')}</SelectItem>
                        <SelectItem value="savings">{t('monthly.savings')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('transaction.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {editCategories.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t('transaction.amount')}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                    />
                    <Button onClick={handleSaveEdit} size="icon" className="shrink-0" disabled={!editAmount || !editCategory}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleCancelEdit} size="icon" variant="outline" className="shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      getTypeColor(rt.type)
                    )}>
                      {rt.type === 'income' ? '+' : '-'}{rt.amount.toLocaleString('hr-HR')} €
                    </span>
                    <span className="font-medium text-sm truncate">{rt.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={rt.isActive}
                      onCheckedChange={() => toggleRecurringTransaction(rt.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStartEdit(rt)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeRecurringTransaction(rt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
