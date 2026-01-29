import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Bell, CalendarIcon, Plus, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Account, PaymentReminder } from '@/types/budget';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReminderFormProps {
  categories: Category[];
  accounts: Account[];
  reminders: PaymentReminder[];
  onSubmit: (reminder: { amount: number; category: string; accountId: string; dueDate: string }) => void;
  onRemove: (id: string) => void;
}

export const ReminderForm = ({
  categories,
  accounts,
  reminders,
  onSubmit,
  onRemove,
}: ReminderFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const { schedulePaymentReminder, cancelPaymentReminder } = useNotifications();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !accountId || !dueDate) return;

    const reminderData = {
      amount: parseFloat(amount),
      category,
      accountId,
      dueDate: dueDate.toISOString(),
    };

    onSubmit(reminderData);
    
    // Schedule notification for this reminder
    schedulePaymentReminder({
      id: crypto.randomUUID(), // Temporary ID, real ID will be assigned in useBudget
      ...reminderData,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });

    setAmount('');
    setCategory('');
    setAccountId('');
    setDueDate(undefined);
  };

  const handleRemove = (id: string) => {
    cancelPaymentReminder(id);
    onRemove(id);
  };

  const getAccountName = (accId: string) => {
    const account = accounts.find((a) => a.id === accId);
    return account?.name || '-';
  };

  const activeReminders = reminders.filter((r) => !r.isCompleted);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {t('reminder.title')}
        </CardTitle>
        <CardDescription>{t('reminder.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={t('transaction.amount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-card border-border"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "dd.MM.yyyy") : t('reminder.selectDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border">
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

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="bg-card border-border flex-1">
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

          <Button
            type="submit"
            disabled={!amount || !category || !accountId || !dueDate}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('reminder.add')}
          </Button>
        </form>

        {activeReminders.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">{t('reminder.list')}</h4>
            <div className="space-y-2">
              {activeReminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reminder.category}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{reminder.amount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}</span>
                      <span>•</span>
                      <span>{format(new Date(reminder.dueDate), 'dd.MM.yyyy')}</span>
                      <span>•</span>
                      <span>{getAccountName(reminder.accountId)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(reminder.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
