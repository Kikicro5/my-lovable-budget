import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ReminderIndicator } from './ReminderIndicator';
import { PaymentReminder, Account } from '@/types/budget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repeat, LogIn, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
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
        <div className="flex items-center gap-1">
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
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/admin')} title="Admin">
              <Shield className="w-3.5 h-3.5" />
            </Button>
          )}
          <ReminderIndicator
            reminders={activeReminders}
            accounts={accounts}
            onComplete={onCompleteReminder || (() => {})}
            onRemove={onRemoveReminder || (() => {})}
            disabled={activeReminders.length === 0}
          />
          {user ? (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => signOut()} title="Odjava">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/auth')} title="Prijava">
              <LogIn className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
