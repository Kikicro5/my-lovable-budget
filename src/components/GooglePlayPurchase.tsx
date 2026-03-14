import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Smartphone } from 'lucide-react';

const PRODUCT_ID = 'premium_yearly';
const DEVICE_ID_KEY = 'budget-card-device-id';

const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

export const GooglePlayPurchase = () => {
  const { checkStatus } = usePremium();
  const { t } = useLanguage();
  const [purchasing, setPurchasing] = useState(false);
  const isAndroid = Capacitor.getPlatform() === 'android';

  const handlePurchase = useCallback(async () => {
    if (!isAndroid) return;
    setPurchasing(true);

    try {
      const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

      // Check billing support
      const { isBillingSupported } = await NativePurchases.isBillingSupported();
      if (!isBillingSupported) {
        toast.error(t('premium.billingNotSupported'));
        return;
      }

      // Get product info
      const { products } = await NativePurchases.getProducts({
        productIdentifiers: [PRODUCT_ID],
        productType: PURCHASE_TYPE.SUBS,
      });

      if (!products || products.length === 0) {
        toast.error(t('premium.productNotFound'));
        return;
      }

      // Initiate purchase
      const transaction = await NativePurchases.purchaseProduct({
        productIdentifier: PRODUCT_ID,
        productType: PURCHASE_TYPE.SUBS,
      });

      if (transaction?.transaction) {
        const tx = transaction.transaction;
        // Verify on server
        const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
          body: {
            action: 'verify-purchase',
            purchaseToken: tx.transactionId,
            productId: PRODUCT_ID,
            deviceId: getDeviceId(),
          },
        });

        if (error || !data?.success) {
          toast.error(t('premium.verificationError'));
        } else {
          toast.success(t('premium.purchaseSuccess'));
          await checkStatus();
        }
      }
    } catch (err: any) {
      // User cancelled
      if (err?.code === 'USER_CANCELED' || err?.message?.includes('cancel')) {
        return;
      }
      console.error('Purchase error:', err);
      toast.error(t('premium.purchaseError'));
    } finally {
      setPurchasing(false);
    }
  }, [isAndroid, checkStatus, t]);

  // On web, show info that purchase is available via Android app
  if (!isAndroid) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Smartphone className="w-5 h-5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          {t('premium.androidOnly')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('premium.subscribeViaGooglePlay')}
      </p>
      <Button
        onClick={handlePurchase}
        disabled={purchasing}
        className="w-full gap-2"
      >
        {purchasing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('premium.processing')}
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            {t('premium.subscribeButton')}
          </>
        )}
      </Button>
    </div>
  );
};
