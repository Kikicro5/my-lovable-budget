import { useState } from 'react';
import { Bell, Clock, CreditCard, TestTube } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

export const NotificationSettings = () => {
  const { settings, updateSettings, permissionGranted, sendTestNotification } = useNotifications();
  const { t } = useLanguage();
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const handleEnableNotifications = async (enabled: boolean) => {
    await updateSettings({ enabled });
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        toast.success('Test obavijest zakazana za 5 sekundi!');
      } else {
        toast.error('Nije moguće poslati test obavijest. Provjeri dozvole.');
      }
    } catch (error) {
      toast.error('Greška pri slanju test obavijesti');
    } finally {
      setIsTestingNotification(false);
    }
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

          {/* Test notification button */}
          <div className="pl-6 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={isTestingNotification}
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTestingNotification ? 'Šaljem...' : 'Test obavijesti (5 sek)'}
            </Button>
          </div>

          {!permissionGranted && (
            <div className="pl-6 space-y-2">
              <p className="text-sm text-destructive">
                {t('notifications.permissionRequired')}
              </p>
              <p className="text-xs text-muted-foreground">
                Ako si na Androidu i dozvola je bila odbijena, uključi je ručno u: Postavke  Aplikacije  BudgetCard  Obavijesti.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
