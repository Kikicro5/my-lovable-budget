import { useLanguage } from '@/i18n/LanguageContext';
import { ReminderIndicator } from './ReminderIndicator';
import { PaymentReminder, Account } from '@/types/budget';
import { Badge } from '@/components/ui/badge';
import { Repeat, Cloud, CloudOff, Loader2, Check, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  lastSyncedAt?: Date | null;
  isInGroup?: boolean;
}

const SyncIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'syncing':
      return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
    case 'synced':
      return <Cloud className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />;
    case 'offline':
      return <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />;
    case 'error':
      return <CloudOff className="w-3.5 h-3.5 text-destructive" />;
    default:
      return null;
  }
};

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
  syncStatus = 'idle',
  lastSyncedAt,
  isInGroup = false,
}: MonthCardProps) => {
  const { t } = useLanguage();
  
  const isRecurringActive = hasRecurring && !recurringApplied;

  const syncLabel: Record<string, string> = {
    syncing: t('sync.status.syncing') || 'Syncing...',
    synced: t('sync.status.synced') || 'Synced',
    offline: t('sync.status.offline') || 'Offline',
    error: t('sync.status.error') || 'Sync error',
  };
  
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
          {syncStatus !== 'idle' && (
            <div className="flex items-center gap-1">
              {lastSyncedAt && syncStatus === 'synced' && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md">
                    <SyncIcon status={syncStatus} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{syncLabel[syncStatus] || ''}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {isInGroup && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t('group.active')}
              </TooltipContent>
            </Tooltip>
          )}
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
