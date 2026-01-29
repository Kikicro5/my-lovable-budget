import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingDown, LineChart, PiggyBank, Edit2, Trash2, Check, X, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useBudget } from '@/hooks/useBudget';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type LimitType = 'expense' | 'investment' | 'savings';

export const BudgetLimitsForm = () => {
  const { t } = useLanguage();
  const { state, setDefaultLimits } = useBudget();
  const { currencySymbol } = useCurrency();
  const [editingType, setEditingType] = useState<LimitType | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingType, setAddingType] = useState<LimitType | null>(null);
  const [addValue, setAddValue] = useState('');

  const limits = [
    { 
      type: 'expense' as LimitType, 
      label: t('limits.expense'), 
      icon: TrendingDown, 
      color: 'text-expense',
      value: state.defaultLimits.expense 
    },
    { 
      type: 'investment' as LimitType, 
      label: t('limits.investment'), 
      icon: LineChart, 
      color: 'text-primary',
      value: state.defaultLimits.investment 
    },
    { 
      type: 'savings' as LimitType, 
      label: t('limits.savings'), 
      icon: PiggyBank, 
      color: 'text-accent',
      value: state.defaultLimits.savings 
    },
  ];

  const handleStartEdit = (type: LimitType, currentValue: number) => {
    setEditingType(type);
    setEditValue(currentValue.toString());
    setAddingType(null);
  };

  const handleSaveEdit = () => {
    if (editingType === null) return;
    
    const newValue = parseFloat(editValue) || 0;
    setDefaultLimits({
      ...state.defaultLimits,
      [editingType]: newValue,
    });
    
    toast({
      title: t('limits.title'),
      description: t('limits.save'),
    });
    
    setEditingType(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingType(null);
    setEditValue('');
  };

  const handleDelete = (type: LimitType) => {
    setDefaultLimits({
      ...state.defaultLimits,
      [type]: 0,
    });
    
    toast({
      title: t('limits.title'),
      description: t('common.delete'),
    });
  };

  const handleStartAdd = (type: LimitType) => {
    setAddingType(type);
    setAddValue('');
    setEditingType(null);
  };

  const handleSaveAdd = () => {
    if (addingType === null) return;
    
    const newValue = parseFloat(addValue) || 0;
    if (newValue <= 0) return;
    
    setDefaultLimits({
      ...state.defaultLimits,
      [addingType]: newValue,
    });
    
    toast({
      title: t('limits.title'),
      description: t('limits.save'),
    });
    
    setAddingType(null);
    setAddValue('');
  };

  const handleCancelAdd = () => {
    setAddingType(null);
    setAddValue('');
  };

  return (
    <div className="space-y-2">
      {limits.map((limit) => {
        const Icon = limit.icon;
        const hasLimit = limit.value > 0;
        const isEditing = editingType === limit.type;
        const isAdding = addingType === limit.type;

        return (
          <div
            key={limit.type}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border bg-card",
              isEditing && "ring-2 ring-primary",
              isAdding && "ring-2 ring-primary"
            )}
          >
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <div className={cn("p-2 rounded-lg bg-muted", limit.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 h-8"
                  autoFocus
                  placeholder="0.00"
                />
                <span className="text-sm text-muted-foreground">{currencySymbol}</span>
                <Button size="icon" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8">
                  <Check className="w-4 h-4 text-income" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8">
                  <X className="w-4 h-4 text-expense" />
                </Button>
              </div>
            ) : isAdding ? (
              <div className="flex-1 flex items-center gap-2">
                <div className={cn("p-2 rounded-lg bg-muted", limit.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addValue}
                  onChange={(e) => setAddValue(e.target.value)}
                  className="flex-1 h-8"
                  autoFocus
                  placeholder="0.00"
                />
                <span className="text-sm text-muted-foreground">{currencySymbol}</span>
                <Button size="icon" variant="ghost" onClick={handleSaveAdd} className="h-8 w-8">
                  <Check className="w-4 h-4 text-income" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelAdd} className="h-8 w-8">
                  <X className="w-4 h-4 text-expense" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted", limit.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{limit.label}</p>
                    {hasLimit ? (
                      <p className="text-sm text-muted-foreground">
                        {limit.value.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{t('limits.noLimit')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {hasLimit ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(limit.type, limit.value)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(limit.type)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartAdd(limit.type)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
