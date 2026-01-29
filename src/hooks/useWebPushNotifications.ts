import { useState, useEffect, useCallback } from 'react';

export interface WebPushSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  paymentReminders: boolean;
}

const DEFAULT_SETTINGS: WebPushSettings = {
  enabled: false,
  dailyReminder: false,
  reminderTime: '20:00',
  paymentReminders: false,
};

const STORAGE_KEY = 'web-push-settings';

// Check if Web Push is supported
export const isWebPushSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export const useWebPushNotifications = () => {
  const [settings, setSettings] = useState<WebPushSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    isWebPushSupported() ? Notification.permission : 'denied'
  );

  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Schedule daily reminder when settings change
  useEffect(() => {
    if (settings.enabled && settings.dailyReminder && permissionStatus === 'granted') {
      scheduleDailyReminder();
    }
  }, [settings.enabled, settings.dailyReminder, settings.reminderTime, permissionStatus]);

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/notification-sw.js', {
        scope: '/',
      });
      console.log('Notification SW registered:', registration);
      setSwRegistration(registration);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
      return null;
    }
  };

  /**
   * Request notification permission from user
   * Returns true if granted, false otherwise
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isWebPushSupported()) {
      console.log('Web Push not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  /**
   * Update notification settings
   * Automatically requests permission when enabling
   */
  const updateSettings = useCallback(async (newSettings: Partial<WebPushSettings>) => {
    if (newSettings.enabled === true && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        console.log('Cannot enable notifications - permission not granted');
        return false;
      }
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    return true;
  }, [permissionStatus, requestPermission]);

  /**
   * Send a local notification immediately
   * @param title - Notification title
   * @param body - Notification body message
   * @param options - Additional notification options
   */
  const sendNotification = useCallback(async (
    title: string,
    body: string,
    options?: {
      icon?: string;
      tag?: string;
      data?: Record<string, unknown>;
      requireInteraction?: boolean;
    }
  ): Promise<boolean> => {
    if (!isWebPushSupported()) {
      console.log('Web Push not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    try {
      // Use service worker to show notification (works even when app is in background)
      const registration = swRegistration || await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body,
        icon: options?.icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: options?.tag || 'default',
        data: options?.data || {},
        requireInteraction: options?.requireInteraction || false,
      } as NotificationOptions);

      console.log('Notification sent:', title);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Fallback to basic Notification API
      try {
        new Notification(title, {
          body,
          icon: options?.icon || '/icon-192.png',
          tag: options?.tag,
        });
        return true;
      } catch (fallbackError) {
        console.error('Fallback notification failed:', fallbackError);
        return false;
      }
    }
  }, [swRegistration]);

  /**
   * Send a test notification (fires in 3 seconds)
   */
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    // Send notification after 3 seconds
    setTimeout(async () => {
      await sendNotification(
        'Test obavijesti',
        'Ako vidiš ovu poruku, Web Push notifikacije rade! 🎉',
        { tag: 'test', requireInteraction: false }
      );
    }, 3000);

    return true;
  }, [permissionStatus, requestPermission, sendNotification]);

  /**
   * Schedule daily reminder using the Notifications API
   * Note: For true scheduled notifications, you'd need a backend server
   * This uses a simple setTimeout approach that works while the page is open
   */
  const scheduleDailyReminder = useCallback(() => {
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    console.log('Daily reminder scheduled for:', scheduledTime, 'delay:', delay);

    // Note: This only works while the page is open
    // For background notifications, you need a push server
    const timeoutId = setTimeout(() => {
      sendNotification(
        'BudgetCard podsjetnik',
        'Ne zaboravi unijeti današnje troškove!',
        { tag: 'daily-reminder', requireInteraction: true }
      );
      // Reschedule for next day
      scheduleDailyReminder();
    }, delay);

    // Store timeout ID for cleanup
    (window as any).__dailyReminderTimeout = timeoutId;

    return () => clearTimeout(timeoutId);
  }, [settings.reminderTime, sendNotification]);

  /**
   * Trigger notification for a payment reminder
   */
  const notifyPaymentDue = useCallback(async (
    category: string,
    amount: number
  ): Promise<boolean> => {
    if (!settings.enabled || !settings.paymentReminders) {
      return false;
    }

    return sendNotification(
      'Podsjetnik za plaćanje',
      `${category}: ${amount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
      { tag: `payment-${category}`, requireInteraction: true }
    );
  }, [settings.enabled, settings.paymentReminders, sendNotification]);

  return {
    // State
    settings,
    permissionStatus,
    isSupported: isWebPushSupported(),
    isPermissionGranted: permissionStatus === 'granted',
    isPermissionDenied: permissionStatus === 'denied',

    // Actions
    updateSettings,
    requestPermission,
    sendNotification,
    sendTestNotification,
    notifyPaymentDue,
  };
};
