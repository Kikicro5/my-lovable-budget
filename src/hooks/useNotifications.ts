import { LocalNotifications, ScheduleOptions, Channel } from '@capacitor/local-notifications';
import { useEffect, useState } from 'react';
import { PaymentReminder } from '@/types/budget';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:mm format
  paymentReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyReminder: false,
  reminderTime: '20:00',
  paymentReminders: false,
};

const STORAGE_KEY = 'notification-settings';
const PAYMENT_NOTIFICATION_BASE_ID = 1000;
const CHANNEL_ID = 'budgetcard-notifications';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  });
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    await checkPermissions();
    await createNotificationChannel();
  };

  const createNotificationChannel = async () => {
    try {
      const channel: Channel = {
        id: CHANNEL_ID,
        name: 'BudgetCard obavijesti',
        description: 'Podsjetnici za unos troškova i plaćanja',
        importance: 4, // HIGH importance
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
      };
      await LocalNotifications.createChannel(channel);
      console.log('Notification channel created:', CHANNEL_ID);
    } catch (error) {
      console.log('Could not create notification channel (web environment):', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const result = await LocalNotifications.checkPermissions();
      setPermissionGranted(result.display === 'granted');
    } catch (error) {
      console.log('Notifications not available (web environment)');
      setPermissionGranted(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      // First check current status
      const currentStatus = await LocalNotifications.checkPermissions();
      console.log('Current notification permission status:', currentStatus.display);
      
      if (currentStatus.display === 'granted') {
        setPermissionGranted(true);
        return true;
      }
      
      // Request permissions - this triggers the system dialog on Android/iOS
      const result = await LocalNotifications.requestPermissions();
      console.log('Permission request result:', result.display);
      
      const granted = result.display === 'granted';
      setPermissionGranted(granted);
      
      if (!granted) {
        console.log('Notification permission denied by user');
      }
      
      return granted;
    } catch (error) {
      console.log('Notifications not available (web environment):', error);
      return false; // Return false on web since notifications won't work
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (newSettings.enabled === true) {
      const granted = await requestPermissions();
      console.log('Permission granted after toggle:', granted);
      
      if (!granted) {
        // Don't enable if permission was denied
        console.log('Cannot enable notifications - permission denied');
        return;
      }
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const scheduleDailyReminder = async () => {
    try {
      await cancelDailyReminder();
      
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const options: ScheduleOptions = {
        notifications: [
          {
            id: 1,
            title: 'BudgetCard',
            body: 'Ne zaboravi unijeti današnje troškove!',
            channelId: CHANNEL_ID,
            schedule: {
              at: scheduledTime,
              allowWhileIdle: true,
              repeats: true,
              every: 'day',
            },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            largeIcon: 'ic_stat_icon_config_sample',
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log('Daily reminder scheduled for:', scheduledTime);
    } catch (error) {
      console.log('Could not schedule notification:', error);
    }
  };

  const cancelDailyReminder = async () => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    } catch (error) {
      console.log('Could not cancel daily reminder:', error);
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

  // Schedule a notification for a payment reminder
  const schedulePaymentReminder = async (reminder: PaymentReminder) => {
    if (!settings.enabled || !settings.paymentReminders) return;

    try {
      const dueDate = new Date(reminder.dueDate);
      dueDate.setHours(9, 0, 0, 0); // Notify at 9 AM on due date
      
      // Don't schedule if the date has already passed
      if (dueDate <= new Date()) return;

      // Generate a unique ID based on reminder ID hash
      const notificationId = PAYMENT_NOTIFICATION_BASE_ID + Math.abs(hashCode(reminder.id));

      const options: ScheduleOptions = {
        notifications: [
          {
            id: notificationId,
            title: 'Podsjetnik za plaćanje',
            body: `${reminder.category}: ${reminder.amount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
            channelId: CHANNEL_ID,
            schedule: {
              at: dueDate,
              allowWhileIdle: true,
              repeats: false,
            },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            largeIcon: 'ic_stat_icon_config_sample',
            extra: { reminderId: reminder.id },
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log('Payment reminder scheduled for:', dueDate);
    } catch (error) {
      console.log('Could not schedule payment reminder:', error);
    }
  };

  // Cancel a specific payment reminder notification
  const cancelPaymentReminder = async (reminderId: string) => {
    try {
      const notificationId = PAYMENT_NOTIFICATION_BASE_ID + Math.abs(hashCode(reminderId));
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    } catch (error) {
      console.log('Could not cancel payment reminder:', error);
    }
  };

  // Schedule notifications for all active reminders
  const scheduleAllPaymentReminders = async (reminders: PaymentReminder[]) => {
    if (!settings.enabled || !settings.paymentReminders) return;

    const activeReminders = reminders.filter(r => !r.isCompleted);
    
    for (const reminder of activeReminders) {
      await schedulePaymentReminder(reminder);
    }
  };

  // Test notification - fires in 5 seconds
  const sendTestNotification = async (): Promise<boolean> => {
    try {
      const granted = await requestPermissions();
      if (!granted) {
        console.log('Cannot send test notification - permission denied');
        return false;
      }

      await createNotificationChannel();

      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 5);

      const options: ScheduleOptions = {
        notifications: [
          {
            id: 9999,
            title: 'Test obavijesti',
            body: 'Ako vidiš ovu poruku, obavijesti rade! 🎉',
            channelId: CHANNEL_ID,
            schedule: {
              at: testTime,
              allowWhileIdle: true,
            },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            largeIcon: 'ic_stat_icon_config_sample',
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log('Test notification scheduled for:', testTime);
      return true;
    } catch (error) {
      console.log('Could not send test notification:', error);
      return false;
    }
  };

  // Get pending notifications for debugging
  const getPendingNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending();
      console.log('Pending notifications:', pending.notifications);
      return pending.notifications;
    } catch (error) {
      console.log('Could not get pending notifications:', error);
      return [];
    }
  };

  return {
    settings,
    updateSettings,
    permissionGranted,
    requestPermissions,
    schedulePaymentReminder,
    cancelPaymentReminder,
    scheduleAllPaymentReminders,
    cancelAllNotifications,
    sendTestNotification,
    getPendingNotifications,
  };
};

// Simple hash function to generate consistent IDs
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
