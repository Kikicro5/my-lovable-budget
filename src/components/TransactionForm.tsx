import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, TrendingUp, TrendingDown, X, LineChart, PiggyBank, ArrowRightLeft, CalendarIcon, Wallet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Account } from '@/types/budget';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TransactionFormProps {
  type: 'income' | 'expense' | 'investment' | 'savings';
  categories: Category[];
  accounts?: Account[];
  onSubmit: (name: string, amount: number, category: string, date: Date, accountId?: string) => void;
  onAddCategory: (category: Category) => void;
  availableForTransfer?: number;
  onTransferToBalance?: (amount: number) => void;
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
  accounts = [],
  onSubmit,
  onAddCategory,
  availableForTransfer = 0,
  onTransferToBalance,
}: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();

  const config = typeConfig[type];
  const Icon = config.icon;
  const canTransfer = (type === 'investment' || type === 'savings') && availableForTransfer > 0 && onTransferToBalance;

  // Check if selected account has sufficient balance for expense/investment/savings
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const requiresBalanceCheck = type !== 'income' && accountId && accountId !== 'none' && selectedAccount;
  const hasInsufficientBalance = requiresBalanceCheck && selectedAccount && parseFloat(amount || '0') > selectedAccount.balance;

  // Account is required for all transactions
  const isAccountRequired = accounts.length > 0;
  const hasValidAccount = accountId && accountId !== 'none';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    // Account is required
    if (isAccountRequired && !hasValidAccount) return;

    // Check balance for expense, investment, savings
    if (requiresBalanceCheck && hasInsufficientBalance) {
      setInsufficientBalance(true);
      return;
    }

    setInsufficientBalance(false);
    onSubmit(category, parseFloat(amount), category, date, accountId);
    setAmount('');
    setCategory('');
    setAccountId('');
    setDate(new Date());
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

  const handleTransfer = () => {
    const transferValue = parseFloat(transferAmount);
    if (!transferValue || transferValue <= 0 || transferValue > availableForTransfer) return;
    onTransferToBalance?.(transferValue);
    setTransferAmount('');
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
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder={t('transaction.amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-card border-border flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal bg-card border-border",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd.MM.yyyy") : <span>{t('transaction.selectDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

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

        {accounts.length > 0 && (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className={cn(
                "bg-card border-border flex-1",
                !hasValidAccount && "border-destructive/50"
              )}>
                <SelectValue placeholder={t('transaction.selectAccount')} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <div className="flex justify-between items-center gap-2">
                      <span>{acc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({acc.balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(insufficientBalance || hasInsufficientBalance) && amount && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{t('transaction.insufficientBalance')}</span>
          </div>
        )}

        <div className={cn("flex gap-2", canTransfer ? "flex-col sm:flex-row" : "")}>
          <Button
            type="submit"
            disabled={hasInsufficientBalance || (isAccountRequired && !hasValidAccount)}
            className={cn(
              'flex-1 font-semibold',
              config.buttonClass
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t(config.titleKey)}
          </Button>
        </div>
      </form>

      {canTransfer && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('transfer.toBalance')} ({t('transfer.available')}: {availableForTransfer.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol})
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              max={availableForTransfer}
              placeholder={t('transfer.enterAmount')}
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="bg-card border-border flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleTransfer}
              disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > availableForTransfer}
              className="shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {t('transfer.toBalance')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
