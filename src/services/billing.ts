import { Capacitor } from '@capacitor/core';

const PRODUCT_ID = '001_01';
const DEVICE_ID_KEY = 'budget-card-device-id';

export const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

let initialized = false;

/**
 * Initialize billing on app start.
 * Safe to call multiple times – only runs once.
 */
export async function initBilling(): Promise<void> {
  if (initialized) return;
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) {
      console.warn('Google Play Billing not supported on this device');
      return;
    }
    initialized = true;
    console.log('Billing initialized successfully');
  } catch (err) {
    console.error('Billing init error:', err);
  }
}

/**
 * Check if product "001_01" is currently purchased / has an active subscription.
 * Returns { isPurchased, purchaseToken? }
 */
export async function checkSubscription(): Promise<{
  isPurchased: boolean;
  purchaseToken?: string;
}> {
  if (Capacitor.getPlatform() !== 'android') {
    return { isPurchased: false };
  }

  try {
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

    const { transactions } = await NativePurchases.restorePurchases({
      productType: PURCHASE_TYPE.SUBS,
    });

    const active = transactions?.find(
      (t: any) => t.productIdentifier === PRODUCT_ID || t.productId === PRODUCT_ID
    );

    return {
      isPurchased: !!active,
      purchaseToken: active?.transactionId || active?.purchaseToken,
    };
  } catch (err) {
    console.error('checkSubscription error:', err);
    return { isPurchased: false };
  }
}

/**
 * Start Google Play purchase flow for product "001_01".
 * Returns the transaction on success, or throws on failure.
 */
export async function purchaseSubscription(): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  if (Capacitor.getPlatform() !== 'android') {
    return { success: false, error: 'Only available on Android' };
  }

  try {
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

    // Verify product exists
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [PRODUCT_ID],
      productType: PURCHASE_TYPE.SUBS,
    });

    if (!products || products.length === 0) {
      return { success: false, error: 'Product not found' };
    }

    // Start purchase
    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: PRODUCT_ID,
      productType: PURCHASE_TYPE.SUBS,
    });

    if (transaction?.transactionId) {
      return { success: true, transactionId: transaction.transactionId };
    }

    return { success: false, error: 'Greška pri kupnji' };
  } catch (err: any) {
    // User cancelled – not an error
    if (err?.code === 'USER_CANCELED' || err?.message?.includes('cancel')) {
      return { success: false, error: 'cancelled' };
    }
    console.error('purchaseSubscription error:', err);
    return { success: false, error: 'Greška pri kupnji' };
  }
}

/**
 * Restore existing purchases from Google Play.
 * Returns list of active subscription product IDs.
 */
export async function restorePurchases(): Promise<{
  restored: boolean;
  activeProducts: string[];
}> {
  if (Capacitor.getPlatform() !== 'android') {
    return { restored: false, activeProducts: [] };
  }

  try {
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

    const { transactions } = await NativePurchases.restorePurchases({
      productType: PURCHASE_TYPE.SUBS,
    });

    const activeProducts = (transactions || [])
      .map((t: any) => t.productIdentifier || t.productId)
      .filter(Boolean);

    return { restored: true, activeProducts };
  } catch (err) {
    console.error('restorePurchases error:', err);
    return { restored: false, activeProducts: [] };
  }
}
