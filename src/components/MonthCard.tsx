import { useLanguage } from '@/i18n/LanguageContext';
import { ReminderIndicator } from './ReminderIndicator';
import { PaymentReminder, Account } from '@/types/budget';
import { Badge } from '@/components/ui/badge';
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
        <h1 className="text-base font-display font-bold text-foreground">
          <span className="flex items-center gap-2">
            <img
              src="/icon-192.png?v=2"
              alt="Budget Card ikona"
              className="h-8 w-8 rounded-lg"
              loading="lazy"
            />
            <span>{t(`month.${month}`)} {year}</span>
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`gap-1 text-xs transition-colors ${
              isRecurringActive 
                ? 'cursor-pointer hover:bg-secondary/80' 
                : 'opacity-40 cursor-default'
            }`}
            onClick={isRecurringActive ? onApplyRecurring : undefined}
          >
            <Repeat className="w-3 h-3" />
          </Badge>
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