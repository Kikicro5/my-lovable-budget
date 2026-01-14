import { Bell, BellRing, AlertTriangle, CheckCircle, XCircle, Loader2, Calendar, TrendingUp, DollarSign, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useLanguage } from '@/i18n/LanguageContext';

export const PushNotificationSettings = () => {
  const {
    settings,
    updateSettings,
    permissionStatus,
    isLoading,
    isSupported,
    togglePushNotifications,
  } = usePushNotifications();
  const { t } = useLanguage();

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('notifications.granted') || 'Odobreno'}
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t('notifications.denied') || 'Odbijeno'}
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t('notifications.unsupported') || 'Nije podržano'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Bell className="w-3 h-3 mr-1" />
            {t('notifications.notSet') || 'Nije postavljeno'}
          </Badge>
        );
    }
  };

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Push obavijesti nisu podržane u ovom pregledniku. Koristite modernu verziju Chrome, Firefox, Edge ili Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-muted-foreground" />
          <Label>{t('notifications.pushStatus') || 'Status push obavijesti'}</Label>
        </div>
        {getPermissionBadge()}
      </div>

      {/* Main toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="push-enabled">{t('notifications.enablePush') || 'Omogući push obavijesti'}</Label>
        </div>
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            id="push-enabled"
            checked={settings.enabled && permissionStatus === 'granted'}
            onCheckedChange={togglePushNotifications}
            disabled={permissionStatus === 'denied'}
          />
        )}
      </div>

      {/* Permission denied warning */}
      {permissionStatus === 'denied' && (
        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            Dozvola za obavijesti je odbijena. Omogućite obavijesti u postavkama preglednika da biste ih koristili.
          </p>
        </div>
      )}

      {/* Request permission button if default */}
      {permissionStatus === 'default' && !settings.enabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => togglePushNotifications(true)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bell className="w-4 h-4 mr-2" />
          )}
          {t('notifications.requestPermission') || 'Zatraži dozvolu za obavijesti'}
        </Button>
      )}

      {/* Notification type settings */}
      {settings.enabled && permissionStatus === 'granted' && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-sm text-muted-foreground font-medium">
            {t('notifications.types') || 'Vrste obavijesti'}
          </p>

          {/* Budget alerts */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="budget-alerts" className="text-sm">
                {t('notifications.budgetAlerts') || 'Upozorenja o budžetu (80%)'}
              </Label>
            </div>
            <Switch
              id="budget-alerts"
              checked={settings.budgetAlerts}
              onCheckedChange={(checked) => updateSettings({ budgetAlerts: checked })}
            />
          </div>

          {/* Weekly report */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="weekly-report" className="text-sm">
                {t('notifications.weeklyReport') || 'Tjedni izvještaj'}
              </Label>
            </div>
            <Switch
              id="weekly-report"
              checked={settings.weeklyReport}
              onCheckedChange={(checked) => updateSettings({ weeklyReport: checked })}
            />
          </div>

          {/* Month end reminder */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="month-end" className="text-sm">
                {t('notifications.monthEndReminder') || 'Podsjetnik za kraj mjeseca'}
              </Label>
            </div>
            <Switch
              id="month-end"
              checked={settings.monthEndReminder}
              onCheckedChange={(checked) => updateSettings({ monthEndReminder: checked })}
            />
          </div>

          {/* Large transaction alert */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="large-transaction" className="text-sm">
                {t('notifications.largeTransaction') || 'Velike transakcije'}
              </Label>
            </div>
            <Switch
              id="large-transaction"
              checked={settings.largeTransactionAlert}
              onCheckedChange={(checked) => updateSettings({ largeTransactionAlert: checked })}
            />
          </div>
        </div>
      )}

      {/* Info about HTTPS */}
      {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Push obavijesti zahtijevaju HTTPS. U produkciji će raditi normalno.
          </p>
        </div>
      )}
    </div>
  );
};
