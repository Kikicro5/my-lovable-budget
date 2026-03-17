import { Capacitor } from '@capacitor/core';

const PRODUCT_ID = '001_01';
const BASE_PLAN = 'premium12';
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
 * Check if subscription "001_01" is currently active.
 */
export async function checkSubscription(): Promise<{
  isPurchased: boolean;
  purchaseToken?: string;
}> {
  if (Capacitor.getPlatform() !== 'android') {
    return { isPurchased: false };
  }

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');

    const result = await NativePurchases.restorePurchases() as any;
    const transactions = result?.transactions || [];

    const active = transactions.find(
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
 * Start Google Play purchase flow for subscription "001_01" with base plan "premium12".
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
    console.log('[Billing] Starting purchase flow...');
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');
    console.log('[Billing] Plugin imported, checking billing support...');

    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    console.log('[Billing] isBillingSupported:', isBillingSupported);
    if (!isBillingSupported) {
      return { success: false, error: 'Google Play Billing nije podržan na ovom uređaju' };
    }

    // Verify product exists
    console.log('[Billing] Fetching products for:', PRODUCT_ID);
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [PRODUCT_ID],
      productType: PURCHASE_TYPE.SUBS,
    });

    console.log('[Billing] Products returned:', JSON.stringify(products));

    if (!products || products.length === 0) {
      return { success: false, error: `Proizvod "${PRODUCT_ID}" nije pronađen u Google Play Console` };
    }

    // Find the base plan offer
    const product = products[0] as any;
    let selectedOfferToken: string | undefined;

    console.log('[Billing] Product details:', JSON.stringify(product));

    if (product.subscriptionOfferDetails && Array.isArray(product.subscriptionOfferDetails)) {
      console.log('[Billing] Offer details:', JSON.stringify(product.subscriptionOfferDetails));
      const offer = product.subscriptionOfferDetails.find(
        (o: any) => o.basePlanId === BASE_PLAN
      );
      if (offer) {
        selectedOfferToken = offer.offerToken;
        console.log('[Billing] Selected offerToken:', selectedOfferToken);
      } else {
        console.warn('[Billing] Base plan "' + BASE_PLAN + '" not found in offers');
      }
    }

    // Start purchase with offer token if available
    const purchaseOptions: any = {
      productIdentifier: PRODUCT_ID,
      planIdentifier: BASE_PLAN,
      productType: PURCHASE_TYPE.SUBS,
    };

    if (selectedOfferToken) {
      purchaseOptions.offerToken = selectedOfferToken;
    }

    console.log('[Billing] Calling purchaseProduct with:', JSON.stringify(purchaseOptions));
    const transaction = await NativePurchases.purchaseProduct(purchaseOptions);
    console.log('[Billing] Transaction result:', JSON.stringify(transaction));

    if (transaction?.transactionId) {
      return { success: true, transactionId: transaction.transactionId };
    }

    return { success: false, error: 'No transactionId returned from purchase' };
  } catch (err: any) {
    if (err?.code === 'USER_CANCELED' || err?.message?.includes('cancel')) {
      return { success: false, error: 'cancelled' };
    }
    const detail = err?.message || JSON.stringify(err);
    console.error('[Billing] purchaseSubscription error:', detail, err);
    return { success: false, error: `Purchase failed: ${detail}` };
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
    const { NativePurchases } = await import('@capgo/native-purchases');

    const result = await NativePurchases.restorePurchases() as any;
    const transactions = result?.transactions || [];

    const activeProducts = transactions
      .map((t: any) => t.productIdentifier || t.productId)
      .filter(Boolean);

    return { restored: true, activeProducts };
  } catch (err) {
    console.error('restorePurchases error:', err);
    return { restored: false, activeProducts: [] };
  }
}
