import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaymentReminder, Account } from '@/types/budget';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReminderIndicatorProps {
  reminders: PaymentReminder[];
  accounts: Account[];
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const ReminderIndicator = ({ 
  reminders, 
  accounts, 
  onComplete, 
  onRemove,
  disabled = false,
}: ReminderIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();

  const hasReminders = reminders.length > 0;
  const isActive = hasReminders && !disabled;

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || '-';
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={isActive ? () => setIsOpen(true) : undefined}
        className={cn(
          "relative p-2 transition-opacity",
          !isActive && "opacity-40 cursor-default"
        )}
      >
        <Bell className={cn(
          "w-5 h-5",
          isActive ? "text-destructive animate-pulse" : "text-muted-foreground"
        )} />
        {hasReminders && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {reminders.length}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-destructive" />
              {t('reminder.dueTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('reminder.dueDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{reminder.category}</p>
                    <p className="text-lg font-bold text-destructive">
                      {reminder.amount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{format(new Date(reminder.dueDate), 'dd.MM.yyyy')}</p>
                    <p>{getAccountName(reminder.accountId)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => {
                      onComplete(reminder.id);
                      if (reminders.length === 1) setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    {t('reminder.markPaid')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      onRemove(reminder.id);
                      if (reminders.length === 1) setIsOpen(false);
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
