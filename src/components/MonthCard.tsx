import { useLanguage } from '@/i18n/LanguageContext';
import { ReminderIndicator } from './ReminderIndicator';
import { PaymentReminder, Account } from '@/types/budget';

import { Repeat } from 'lucide-react';

interface MonthCardProps {
  month: number;
  year: number;
  activeReminders?: PaymentReminder[];
  accounts?: Account[];
  onCompleteReminder?: (id: string) => void;
  onRemoveReminder?: (id: string) => void;
  hasRecurring?: boolean;
  recurringApplied?: boolean;
  onApplyRecurring?: () => void;
}

export const MonthCard = ({ 
  month, 
  year, 
  activeReminders = [], 
  accounts = [],
  onCompleteReminder,
  onRemoveReminder,
  hasRecurring = false,
  recurringApplied = false,
  onApplyRecurring,
}: MonthCardProps) => {
  const { t } = useLanguage();
  
  const isRecurringActive = hasRecurring && !recurringApplied;
  
  return (
    <div className="bg-card rounded-xl p-2.5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-sm font-medium text-muted-foreground">
          {t(`month.${month}`)} {year}
        </h1>
        <div className="flex items-center gap-2">
          <button
            className={`p-1.5 rounded-md transition-colors ${
              isRecurringActive 
                ? 'cursor-pointer hover:bg-secondary/80 text-foreground' 
                : 'opacity-40 cursor-default text-muted-foreground'
            }`}
            onClick={isRecurringActive ? onApplyRecurring : undefined}
            title={t('recurring.apply')}
          >
            <Repeat className="w-4 h-4" />
          </button>
          <ReminderIndicator
            reminders={activeReminders}
            accounts={accounts}
            onComplete={onCompleteReminder || (() => {})}
            onRemove={onRemoveReminder || (() => {})}
            disabled={activeReminders.length === 0}
          />
        </div>
      </div>
    </div>
  );
};