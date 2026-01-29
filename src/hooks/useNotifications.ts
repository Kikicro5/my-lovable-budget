import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { useEffect, useState } from 'react';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:mm format
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyReminder: false,
  reminderTime: '20:00',
};

const STORAGE_KEY = 'notification-settings';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (settings.enabled && settings.dailyReminder) {
      scheduleDailyReminder();
    } else {
      cancelAllNotifications();
    }
  }, [settings]);

  const checkPermissions = async () => {
    try {
      const result = await LocalNotifications.checkPermissions();
      setPermissionGranted(result.display === 'granted');
    } catch (error) {
      console.log('Notifications not available (web environment)');
      // In web environment, we'll still allow enabling settings
      // They just won't work until running on native
      setPermissionGranted(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.log('Notifications not available (web environment)');
      // Return true for web to allow settings to be saved
      // They will work when running on native device
      return true;
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    // If enabling notifications, try to request permissions
    if (newSettings.enabled === true) {
      await requestPermissions();
    }
    // Always update settings - they'll be saved for when app runs on native
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const scheduleDailyReminder = async () => {
    try {
      await cancelAllNotifications();
      
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const options: ScheduleOptions = {
        notifications: [
          {
            id: 1,
            title: 'BudgetCard',
            body: 'Ne zaboravi unijeti današnje troškove!',
            schedule: {
              at: scheduledTime,
              repeats: true,
              every: 'day',
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      };

      await LocalNotifications.schedule(options);
    } catch (error) {
      console.log('Could not schedule notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications,
        });
      }
    } catch (error) {
      console.log('Could not cancel notifications:', error);
    }
  };

  return {
    settings,
    updateSettings,
    permissionGranted,
    requestPermissions,
  };
};
