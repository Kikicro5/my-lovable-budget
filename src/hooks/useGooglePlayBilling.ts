import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Product IDs - must match Google Play Console subscription products
export const SUBSCRIPTION_PRODUCTS = {
  YEARLY: 'premium_yearly',
} as const;

interface ProductInfo {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceMicros: number;
  currency: string;
}

interface PurchaseResult {
  success: boolean;
  purchaseToken?: string;
  orderId?: string;
  error?: string;
}

export const useGooglePlayBilling = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const isNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  useEffect(() => {
    if (!isNative) {
      setLoading(false);
      return;
    }

    const initBilling = async () => {
      try {
        const { NativePurchases } = await import('@capgo/native-purchases');
        
        // Get available products
        const { products: fetchedProducts } = await NativePurchases.getProducts({
          productIds: [SUBSCRIPTION_PRODUCTS.YEARLY],
          productType: 'SUBSCRIPTION',
        });

        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts.map((p: any) => ({
            productId: p.productId,
            title: p.title || 'Premium',
            description: p.description || '',
            price: p.price || '',
            priceMicros: p.priceMicros || 0,
            currency: p.currency || 'EUR',
          })));
          setIsAvailable(true);
        }
      } catch (err) {
        console.error('Google Play Billing init error:', err);
        setIsAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    initBilling();
  }, [isNative]);

  const purchase = useCallback(async (productId: string): Promise<PurchaseResult> => {
    if (!isNative) {
      return { success: false, error: 'Google Play Billing is only available on Android' };
    }

    setPurchasing(true);
    try {
      const { NativePurchases } = await import('@capgo/native-purchases');
      
      const result = await NativePurchases.purchaseProduct({
        productId,
        productType: 'SUBSCRIPTION',
      });

      if (result?.purchaseToken) {
        return {
          success: true,
          purchaseToken: result.purchaseToken,
          orderId: result.orderId,
        };
      }

      return { success: false, error: 'Purchase was not completed' };
    } catch (err: any) {
      console.error('Purchase error:', err);
      if (err?.code === 'USER_CANCELLED' || err?.message?.includes('cancel')) {
        return { success: false, error: 'cancelled' };
      }
      return { success: false, error: err?.message || 'Purchase failed' };
    } finally {
      setPurchasing(false);
    }
  }, [isNative]);

  const restorePurchases = useCallback(async (): Promise<PurchaseResult> => {
    if (!isNative) {
      return { success: false, error: 'Not available on web' };
    }

    try {
      const { NativePurchases } = await import('@capgo/native-purchases');
      const { purchases } = await NativePurchases.restorePurchases();

      if (purchases && purchases.length > 0) {
        const activePurchase = purchases[0];
        return {
          success: true,
          purchaseToken: activePurchase.purchaseToken,
          orderId: activePurchase.orderId,
        };
      }

      return { success: false, error: 'No active purchases found' };
    } catch (err: any) {
      console.error('Restore error:', err);
      return { success: false, error: err?.message || 'Restore failed' };
    }
  }, [isNative]);

  return {
    isAvailable,
    isNative,
    products,
    loading,
    purchasing,
    purchase,
    restorePurchases,
  };
};
