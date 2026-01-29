/**
 * Example: How to trigger Web Push notifications on specific events
 * 
 * This file shows patterns for integrating notifications with your app logic.
 */

import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

// ============================================
// PATTERN 1: Inside a React component
// ============================================

export const ExampleNotificationUsage = () => {
  const { sendNotification, notifyPaymentDue, settings } = useWebPushNotifications();

  // Example: Notify when a transaction is added
  const handleTransactionAdded = async (amount: number, category: string) => {
    // Your transaction logic here...
    
    // Then send notification
    await sendNotification(
      'Transakcija dodana',
      `Dodano ${amount.toFixed(2)} € u kategoriju ${category}`,
      { tag: 'transaction-added' }
    );
  };

  // Example: Notify when budget limit is exceeded
  const handleBudgetExceeded = async (category: string, limit: number, spent: number) => {
    await sendNotification(
      '⚠️ Prekoračen budžet!',
      `Kategorija "${category}": potrošeno ${spent.toFixed(2)} € od ${limit.toFixed(2)} €`,
      { 
        tag: `budget-exceeded-${category}`,
        requireInteraction: true, // Notification stays until user interacts
      }
    );
  };

  // Example: Notify about payment due
  const handlePaymentDue = async (category: string, amount: number) => {
    // Uses the built-in payment notification (respects user settings)
    await notifyPaymentDue(category, amount);
  };

  return null; // This is just an example, not a real component
};


// ============================================
// PATTERN 2: Outside React (utility function)
// ============================================

/**
 * Send a notification from anywhere in your code
 * Note: User must have granted permission first
 */
export async function sendWebNotification(
  title: string,
  body: string,
  options?: { tag?: string; icon?: string }
): Promise<boolean> {
  // Check if notifications are supported and permitted
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  try {
    // Use service worker if available (works in background)
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: options?.icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: options?.tag || 'default',
    });
    return true;
  } catch (error) {
    // Fallback to basic Notification API
    try {
      new Notification(title, { body, icon: options?.icon || '/icon-192.png' });
      return true;
    } catch (e) {
      console.error('Could not send notification:', e);
      return false;
    }
  }
}


// ============================================
// PATTERN 3: Event-driven notifications
// ============================================

/**
 * Example: Listen for custom events and trigger notifications
 * Add this to your App.tsx or a dedicated NotificationHandler component
 */
export const setupEventNotifications = () => {
  // Listen for custom 'budget-exceeded' event
  window.addEventListener('budget-exceeded', ((event: CustomEvent) => {
    const { category, spent, limit } = event.detail;
    sendWebNotification(
      'Budžet prekoračen',
      `${category}: ${spent}€ / ${limit}€`
    );
  }) as EventListener);

  // Listen for 'payment-due' event
  window.addEventListener('payment-due', ((event: CustomEvent) => {
    const { category, amount, dueDate } = event.detail;
    sendWebNotification(
      'Dospijeće plaćanja',
      `${category}: ${amount}€ - ${dueDate}`,
      { tag: `payment-${category}` }
    );
  }) as EventListener);
};

/**
 * Helper to dispatch notification events from anywhere
 */
export const dispatchBudgetExceededEvent = (category: string, spent: number, limit: number) => {
  window.dispatchEvent(new CustomEvent('budget-exceeded', {
    detail: { category, spent, limit }
  }));
};

export const dispatchPaymentDueEvent = (category: string, amount: number, dueDate: string) => {
  window.dispatchEvent(new CustomEvent('payment-due', {
    detail: { category, amount, dueDate }
  }));
};
