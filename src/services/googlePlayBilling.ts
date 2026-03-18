import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { Capacitor } from '@capacitor/core';

const PRODUCT_ID = '001_01';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const getSubscriptionProduct = async () => {
  if (!isNativePlatform()) return null;

  try {
    const result = await NativePurchases.getProduct({
      productIdentifier: PRODUCT_ID,
      productType: PURCHASE_TYPE.SUBS,
    });
    return result.product;
  } catch (error) {
    console.error('Failed to get subscription product:', error);
    return null;
  }
};

export const purchaseSubscription = async (): Promise<{
  success: boolean;
  purchaseToken?: string;
  error?: string;
}> => {
  if (!isNativePlatform()) {
    return { success: false, error: 'Not on Android platform' };
  }

  try {
    const result = await NativePurchases.purchaseProduct({
      productIdentifier: PRODUCT_ID,
      productType: PURCHASE_TYPE.SUBS,
      quantity: 1,
    });

    if (result.transactionId) {
      return {
        success: true,
        purchaseToken: result.transactionId,
      };
    }

    return { success: false, error: 'Purchase failed' };
  } catch (error: any) {
    if (error?.code === 'USER_CANCELLED' || error?.message?.includes('cancel')) {
      return { success: false, error: 'cancelled' };
    }
    console.error('Purchase error:', error);
    return { success: false, error: error?.message || 'Purchase failed' };
  }
};

export const restorePurchases = async (): Promise<{
  success: boolean;
  purchaseToken?: string;
  error?: string;
}> => {
  if (!isNativePlatform()) {
    return { success: false, error: 'Not on Android platform' };
  }

  try {
    const result = await NativePurchases.restorePurchases() as any;
    const sub = result?.activeSubscriptions?.[0];
    if (sub) {
      return { success: true, purchaseToken: sub };
    }
    return { success: false, error: 'No active subscriptions found' };
  } catch (error: any) {
    console.error('Restore purchases error:', error);
    return { success: false, error: error?.message || 'Restore failed' };
  }
};

export const manageSubscriptions = async () => {
  if (!isNativePlatform()) return;
  try {
    await NativePurchases.manageSubscriptions();
  } catch (error) {
    console.error('Failed to open subscription management:', error);
  }
};
