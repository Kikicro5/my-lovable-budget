import { Bell, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useWebPushNotifications, isWebPushSupported } from '@/hooks/useWebPushNotifications';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

export const WebPushNotificationSettings = () => {
  const {
    settings,
    updateSettings,
    isSupported,
    isPermissionGranted,
    isPermissionDenied,
    requestPermission,
  } = useWebPushNotifications();
  
  const { t } = useLanguage();

  const handleEnableNotifications = async (enabled: boolean) => {
    const success = await updateSettings({ enabled });
    if (!success && enabled) {
      toast.error('Nije moguće uključiti obavijesti. Provjeri dozvole preglednika.');
    }
  };


  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Dozvola za obavijesti odobrena!');
    } else {
      toast.error('Dozvola za obavijesti odbijena.');
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <AlertTriangle className="w-4 h-4" />
        <p className="text-sm">Web Push notifikacije nisu podržane u ovom pregledniku.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission denied warning */}
      {isPermissionDenied && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">Obavijesti su blokirane</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Klikni na ikonu lokota u adresnoj traci preglednika → Dozvole → Obavijesti → Dopusti
          </p>
          <Button variant="outline" size="sm" onClick={handleRequestPermission}>
            Zatraži dozvolu ponovno
          </Button>
        </div>
      )}

      {/* Main toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="web-notifications-enabled">{t('notifications.enable')}</Label>
        </div>
        <Switch
          id="web-notifications-enabled"
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
              <Label htmlFor="web-payment-reminders">{t('notifications.paymentReminders')}</Label>
            </div>
            <Switch
              id="web-payment-reminders"
              checked={settings.paymentReminders}
              onCheckedChange={(checked) => updateSettings({ paymentReminders: checked })}
            />
          </div>

          {/* Daily reminder */}
          <div className="flex items-center justify-between pl-6">
            <Label htmlFor="web-daily-reminder">{t('notifications.dailyReminder')}</Label>
            <Switch
              id="web-daily-reminder"
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => updateSettings({ dailyReminder: checked })}
            />
          </div>

          {/* Reminder time */}
          {settings.dailyReminder && (
            <div className="flex items-center justify-between pl-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="web-reminder-time">{t('notifications.reminderTime')}</Label>
              </div>
              <Input
                id="web-reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                className="w-28"
              />
            </div>
          )}

          {/* Note about daily reminders */}
          {settings.dailyReminder && (
            <p className="text-xs text-muted-foreground pl-6">
              Napomena: Dnevni podsjetnik radi samo dok je aplikacija otvorena u pregledniku.
            </p>
          )}


          {/* Permission status */}
          {!isPermissionGranted && !isPermissionDenied && (
            <p className="text-sm text-amber-600 dark:text-amber-400 pl-6">
              {t('notifications.permissionRequired')}
            </p>
          )}
        </>
      )}
    </div>
  );
};
