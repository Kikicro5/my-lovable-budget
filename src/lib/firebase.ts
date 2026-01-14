import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

// Firebase configuration - Replace these with your Firebase project details
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// VAPID key for web push - Get this from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = "YOUR_VAPID_KEY";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

// Initialize Firebase
export const initializeFirebase = (): FirebaseApp | null => {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

// Get Messaging instance
export const getMessagingInstance = (): Messaging | null => {
  try {
    if (!app) {
      app = initializeFirebase();
    }
    if (app && !messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error('Firebase Messaging initialization error:', error);
    return null;
  }
};

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Get current permission status
export const getNotificationPermissionStatus = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // Check if notifications are supported
    if (!isNotificationSupported()) {
      return { 
        success: false, 
        error: 'Push notifications are not supported in this browser' 
      };
    }

    // Check if we're on HTTPS or localhost
    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecureContext) {
      return { 
        success: false, 
        error: 'Push notifications require HTTPS or localhost' 
      };
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      return { 
        success: false, 
        error: 'Notification permission was denied' 
      };
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    // Get messaging instance
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      return { 
        success: false, 
        error: 'Failed to initialize Firebase Messaging' 
      };
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token:', token);
      // Save token to localStorage
      localStorage.setItem('fcm-token', token);
      return { success: true, token };
    } else {
      return { 
        success: false, 
        error: 'Failed to get FCM token' 
      };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Setup foreground message listener
export const setupMessageListener = (callback: (payload: MessagePayload) => void): (() => void) | null => {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      console.error('Messaging instance not available');
      return null;
    }

    const unsubscribe = onMessage(messagingInstance, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return null;
  }
};

// Get stored FCM token
export const getStoredFCMToken = (): string | null => {
  return localStorage.getItem('fcm-token');
};

// Clear stored FCM token
export const clearStoredFCMToken = (): void => {
  localStorage.removeItem('fcm-token');
};
