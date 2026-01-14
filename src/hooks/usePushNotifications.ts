import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MessagePayload } from 'firebase/messaging';
import {
  initializeFirebase,
  requestNotificationPermission,
  setupMessageListener,
  getNotificationPermissionStatus,
  isNotificationSupported,
  getStoredFCMToken,
  clearStoredFCMToken,
} from '@/lib/firebase';

export interface PushNotificationSettings {
  enabled: boolean;
  budgetAlerts: boolean;
  weeklyReport: boolean;
  monthEndReminder: boolean;
  largeTransactionAlert: boolean;
}

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: false,
  budgetAlerts: true,
  weeklyReport: true,
  monthEndReminder: true,
  largeTransactionAlert: true,
};

const STORAGE_KEY = 'push-notification-settings';

export const usePushNotifications = () => {
  const [settings, setSettings] = useState<PushNotificationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Initialize Firebase and check permission status
  useEffect(() => {
    const init = async () => {
      const supported = isNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        initializeFirebase();
        setPermissionStatus(getNotificationPermissionStatus());
        setFcmToken(getStoredFCMToken());
      }
    };

    init();
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Setup foreground message listener when enabled
  useEffect(() => {
    if (!settings.enabled || permissionStatus !== 'granted') return;

    const unsubscribe = setupMessageListener((payload: MessagePayload) => {
      handleForegroundMessage(payload);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [settings.enabled, permissionStatus]);

  // Handle foreground messages
  const handleForegroundMessage = (payload: MessagePayload) => {
    const title = payload.notification?.title || 'BudgetCard';
    const body = payload.notification?.body || 'Imate novu obavijest';

    // Show toast notification when app is open
    toast.info(title, {
      description: body,
      duration: 5000,
    });

    // Also show native notification if supported
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    }
  };

  // Enable push notifications
  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (!isSupported) {
        toast.error('Push obavijesti nisu podržane u ovom pregledniku');
        return false;
      }

      const result = await requestNotificationPermission();
      
      if (result.success && result.token) {
        setFcmToken(result.token);
        setPermissionStatus('granted');
        setSettings(prev => ({ ...prev, enabled: true }));
        toast.success('Push obavijesti su uspješno omogućene!');
        return true;
      } else {
        const errorMessage = result.error || 'Nije moguće omogućiti obavijesti';
        toast.error(errorMessage);
        
        if (result.error?.includes('denied')) {
          setPermissionStatus('denied');
        }
        return false;
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast.error('Greška pri omogućavanju obavijesti');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Disable push notifications
  const disablePushNotifications = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: false }));
    clearStoredFCMToken();
    setFcmToken(null);
    toast.info('Push obavijesti su isključene');
  }, []);

  // Update specific setting
  const updateSettings = useCallback((newSettings: Partial<PushNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Toggle push notifications
  const togglePushNotifications = useCallback(async (enabled: boolean) => {
    if (enabled) {
      return enablePushNotifications();
    } else {
      disablePushNotifications();
      return true;
    }
  }, [enablePushNotifications, disablePushNotifications]);

  return {
    settings,
    updateSettings,
    permissionStatus,
    fcmToken,
    isLoading,
    isSupported,
    enablePushNotifications,
    disablePushNotifications,
    togglePushNotifications,
  };
};
