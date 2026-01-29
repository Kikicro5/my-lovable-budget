import { useState } from 'react';
import { Repeat, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBudget } from '@/hooks/useBudget';
import { useLanguage } from '@/i18n/LanguageContext';
import { RecurringTransaction } from '@/types/budget';

export const RecurringTransactionsManager = () => {
  const { state, addRecurringTransaction, removeRecurringTransaction, toggleRecurringTransaction } = useBudget();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'investment' | 'savings'>('expense');
  const [category, setCategory] = useState('');

  const categories = state.savedCategories[type];

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-emerald-500';
      case 'expense': return 'text-rose-500';
      case 'investment': return 'text-blue-500';
      case 'savings': return 'text-amber-500';
      default: return 'text-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Repeat className="w-4 h-4" />
          {t('recurring.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            {t('recurring.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('recurring.description')}
          </p>
          
          {/* Add new recurring transaction */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">{t('recurring.add')}</h4>
            
            <Select value={type} onValueChange={(v: typeof type) => { setType(v); setCategory(''); }}>
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
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
            
            <Input
              type="number"
              placeholder={t('transaction.amount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            
            <Button onClick={handleAdd} className="w-full" disabled={!amount || !category}>
              <Plus className="w-4 h-4 mr-2" />
              {t('recurring.add')}
            </Button>
          </div>
          
          {/* List of recurring transactions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('recurring.list')}</h4>
            
            {state.recurringTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('recurring.empty')}
              </p>
            ) : (
              <div className="space-y-2">
                {state.recurringTransactions.map((rt) => (
                  <div
                    key={rt.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      rt.isActive ? 'bg-card' : 'bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{rt.name}</span>
                        <span className={`text-sm ${getTypeColor(rt.type)}`}>
                          {rt.type === 'income' ? '+' : '-'}{rt.amount.toLocaleString('hr-HR')} €
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rt.category} • {t(`monthly.${rt.type}`)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rt.isActive}
                        onCheckedChange={() => toggleRecurringTransaction(rt.id)}
                      />
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
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
