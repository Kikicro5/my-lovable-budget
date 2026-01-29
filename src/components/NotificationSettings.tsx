import { Bell, Clock, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/i18n/LanguageContext';

export const NotificationSettings = () => {
  const { settings, updateSettings, permissionGranted } = useNotifications();
  const { t } = useLanguage();

  const handleEnableNotifications = async (enabled: boolean) => {
    await updateSettings({ enabled });
  };

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="notifications-enabled">{t('notifications.enable')}</Label>
        </div>
        <Switch
          id="notifications-enabled"
          checked={settings.enabled}
          onCheckedChange={handleEnableNotifications}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Payment reminders */}
          <div className="flex items-center justify-between pl-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="payment-reminders">{t('notifications.paymentReminders')}</Label>
            </div>
            <Switch
              id="payment-reminders"
              checked={settings.paymentReminders}
              onCheckedChange={(checked) => updateSettings({ paymentReminders: checked })}
            />
          </div>

          {/* Daily reminder */}
          <div className="flex items-center justify-between pl-6">
            <Label htmlFor="daily-reminder">{t('notifications.dailyReminder')}</Label>
            <Switch
              id="daily-reminder"
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => updateSettings({ dailyReminder: checked })}
            />
          </div>

          {/* Reminder time */}
          {settings.dailyReminder && (
            <div className="flex items-center justify-between pl-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="reminder-time">{t('notifications.reminderTime')}</Label>
              </div>
              <Input
                id="reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                className="w-28"
              />
            </div>
          )}

          {!permissionGranted && (
            <p className="text-sm text-amber-600 dark:text-amber-400 pl-6">
              {t('notifications.permissionRequired')}
            </p>
          )}
        </>
      )}
    </div>
  );
};
