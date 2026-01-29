import { useLanguage } from '@/i18n/LanguageContext';
import { ReminderIndicator } from './ReminderIndicator';
import { PaymentReminder, Account } from '@/types/budget';

interface MonthCardProps {
  month: number;
  year: number;
  activeReminders?: PaymentReminder[];
  accounts?: Account[];
  onCompleteReminder?: (id: string) => void;
  onRemoveReminder?: (id: string) => void;
}

export const MonthCard = ({ 
  month, 
  year, 
  activeReminders = [], 
  accounts = [],
  onCompleteReminder,
  onRemoveReminder,
}: MonthCardProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-card rounded-xl p-2.5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between">
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
        {activeReminders.length > 0 && onCompleteReminder && onRemoveReminder && (
          <ReminderIndicator
            reminders={activeReminders}
            accounts={accounts}
            onComplete={onCompleteReminder}
            onRemove={onRemoveReminder}
          />
        )}
      </div>
    </div>
  );
};