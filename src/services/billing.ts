import { isNativeAndroid } from '@/utils/platform';

const SUBSCRIPTION_PRODUCT_ID = '001_01';
const TRIAL_PRODUCT_ID = '001-02';
const PLAN_IDENTIFIER = 'premium12';

export interface BillingProduct {
  identifier: string;
  priceString: string;
  price: number;
  title: string;
  description: string;
}

export interface BillingError {
  code: string;
  message: string;
  userMessage: string;
}

function mapError(err: any): BillingError {
  const code = err?.code || err?.message || 'UNKNOWN';
  const message = err?.message || String(err);

  if (code === 'PURCHASE_CANCELLED' || message.includes('cancel')) {
    return { code: 'CANCELLED', message, userMessage: 'Kupnja je otkazana.' };
  }
  if (code === 'ITEM_ALREADY_OWNED' || message.includes('already owned')) {
    return { code: 'ALREADY_OWNED', message, userMessage: 'Već posjedujete ovu pretplatu. Pokušajte "Obnovi pretplatu".' };
  }
  if (code === 'ITEM_UNAVAILABLE' || message.includes('unavailable')) {
    return { code: 'UNAVAILABLE', message, userMessage: 'Proizvod trenutno nije dostupan. Pokušajte ponovo kasnije.' };
  }
  if (code === 'DEVELOPER_ERROR' || message.includes('developer')) {
    return { code: 'DEVELOPER_ERROR', message, userMessage: 'Greška u konfiguraciji trgovine. Kontaktirajte podršku.' };
  }
  if (code === 'BILLING_UNAVAILABLE' || message.includes('billing')) {
    return { code: 'BILLING_UNAVAILABLE', message, userMessage: 'Google Play usluge nisu dostupne na ovom uređaju.' };
  }
  if (code === 'NETWORK_ERROR' || message.includes('network') || message.includes('internet')) {
    return { code: 'NETWORK_ERROR', message, userMessage: 'Nema internetske veze. Provjerite mrežu i pokušajte ponovo.' };
  }

  return { code: 'UNKNOWN', message, userMessage: 'Došlo je do greške pri kupnji. Pokušajte ponovo.' };
}

export async function initBilling(): Promise<boolean> {
  if (!isNativeAndroid()) return false;

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    // Initialize the plugin - no explicit init needed for @capgo/native-purchases
    // but we verify it's available
    console.log('[Billing] Initialized on Android');
    return true;
  } catch (err) {
    console.error('[Billing] Init failed:', err);
    return false;
  }
}

export async function getProducts(): Promise<BillingProduct[]> {
  if (!isNativeAndroid()) return [];

  try {
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [SUBSCRIPTION_PRODUCT_ID, TRIAL_PRODUCT_ID],
      productType: PURCHASE_TYPE.SUBS,
    });

    return products.map((p: any) => ({
      identifier: p.identifier || p.productId,
      priceString: p.priceString || `${(p.price || 0).toFixed(2)} €`,
      price: p.price || 0,
      title: p.title || '',
      description: p.description || '',
    }));
  } catch (err) {
    console.error('[Billing] Failed to load products:', err);
    return [];
  }
}

export async function purchaseSubscription(userId?: string): Promise<{ success: boolean; transaction?: any; error?: BillingError }> {
  if (!isNativeAndroid()) {
    return { success: false, error: { code: 'NOT_ANDROID', message: 'Not on Android', userMessage: 'Google Play kupnja dostupna je samo na Android uređajima.' } };
  }

  try {
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: SUBSCRIPTION_PRODUCT_ID,
      planIdentifier: PLAN_IDENTIFIER,
      productType: PURCHASE_TYPE.SUBS,
      appAccountToken: userId,
    });

    return { success: true, transaction };
  } catch (err: any) {
    const billingError = mapError(err);
    if (billingError.code === 'CANCELLED') {
      return { success: false, error: billingError };
    }
    console.error('[Billing] Purchase error:', err);
    return { success: false, error: billingError };
  }
}

export async function purchaseTrial(userId?: string): Promise<{ success: boolean; transaction?: any; error?: BillingError }> {
  if (!isNativeAndroid()) {
    return { success: false, error: { code: 'NOT_ANDROID', message: 'Not on Android', userMessage: 'Google Play kupnja dostupna je samo na Android uređajima.' } };
  }

  try {
    const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: TRIAL_PRODUCT_ID,
      productType: PURCHASE_TYPE.SUBS,
      appAccountToken: userId,
    });

    return { success: true, transaction };
  } catch (err: any) {
    const billingError = mapError(err);
    if (billingError.code === 'CANCELLED') {
      return { success: false, error: billingError };
    }
    console.error('[Billing] Trial purchase error:', err);
    return { success: false, error: billingError };
  }
}

export async function checkSubscription(): Promise<{ isActive: boolean; expiresAt?: string }> {
  if (!isNativeAndroid()) return { isActive: false };

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    const result = await NativePurchases.getAppTransaction();

    if (result && (result as any).productIdentifier) {
      return { isActive: true, expiresAt: (result as any).expiresDate || undefined };
    }

    return { isActive: false };
  } catch (err) {
    console.error('[Billing] Check subscription error:', err);
    return { isActive: false };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; restored: number; error?: BillingError }> {
  if (!isNativeAndroid()) {
    return { success: false, restored: 0, error: { code: 'NOT_ANDROID', message: 'Not on Android', userMessage: 'Google Play dostupan je samo na Android uređajima.' } };
  }

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    const result = await NativePurchases.restorePurchases();

    const restoredCount = result?.transactions?.length || 0;
    return { success: true, restored: restoredCount };
  } catch (err: any) {
    console.error('[Billing] Restore error:', err);
    return { success: false, restored: 0, error: mapError(err) };
  }
}
