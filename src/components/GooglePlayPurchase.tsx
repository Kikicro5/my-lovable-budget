import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Crown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGooglePlayBilling, SUBSCRIPTION_PRODUCTS } from '@/hooks/useGooglePlayBilling';

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
  const { user } = useAuth();
  const { checkStatus } = usePremium();
  const { t } = useLanguage();
  const { isAvailable, isNative, products, loading, purchasing, purchase, restorePurchases } = useGooglePlayBilling();
  const [verifying, setVerifying] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    const result = await purchase(SUBSCRIPTION_PRODUCTS.YEARLY);

    if (!result.success) {
      if (result.error !== 'cancelled') {
        toast.error(t('premium.paypalError'));
      }
      return;
    }

    // Verify on server
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
        body: {
          purchaseToken: result.purchaseToken,
          productId: SUBSCRIPTION_PRODUCTS.YEARLY,
          deviceId: getDeviceId(),
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Verification failed');
      }

      setPurchaseComplete(true);
      toast.success(t('premium.activatedDays').replace('{days}', String(data.durationDays)));
      await checkStatus();
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(t('premium.captureError'));
    } finally {
      setVerifying(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (!result.success) {
        toast.error(t('premium.noRestorePurchases') || 'No active purchases found');
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
        body: {
          purchaseToken: result.purchaseToken,
          productId: SUBSCRIPTION_PRODUCTS.YEARLY,
          deviceId: getDeviceId(),
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Verification failed');
      }

      setPurchaseComplete(true);
      toast.success(t('premium.purchaseActivated'));
      await checkStatus();
    } catch (err) {
      console.error('Restore error:', err);
      toast.error(t('premium.captureError'));
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (purchaseComplete) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
        <CheckCircle className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium text-sm text-foreground">{t('premium.purchaseSuccess')}</p>
          <p className="text-xs text-muted-foreground">{t('premium.purchaseActivated')}</p>
        </div>
      </div>
    );
  }


  // On web or if billing not available, show info message
  if (!isNative || !isAvailable) {
    return (
      <div className="text-center p-3">
        <p className="text-xs text-muted-foreground">
          {t('premium.availableOnAndroid') || 'Premium subscription is available through the Android app on Google Play Store.'}
        </p>
      </div>
    );
  }

  const yearlyProduct = products.find(p => p.productId === SUBSCRIPTION_PRODUCTS.YEARLY);

  return (
    <div className="space-y-3">
      {yearlyProduct && (
        <div className="p-4 rounded-lg border border-primary bg-primary/10 text-center">
          <p className="text-xs text-muted-foreground">{t('premium.months12')}</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {yearlyProduct.price}
          </p>
          <p className="text-xs text-primary mt-0.5">
            {t('premium.autoRenew') || 'Auto-renewing subscription'}
          </p>
        </div>
      )}

      <Button
        onClick={handlePurchase}
        disabled={purchasing || verifying}
        className="w-full gap-2"
        size="lg"
      >
        {purchasing || verifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('premium.processing')}
          </>
        ) : (
          <>
            <Crown className="w-4 h-4" />
            {t('premium.subscribe') || 'Subscribe'}
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        onClick={handleRestore}
        disabled={restoring}
        className="w-full gap-2 text-xs"
        size="sm"
      >
        {restoring ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCw className="w-3 h-3" />
        )}
        {t('premium.restorePurchases') || 'Restore purchases'}
      </Button>
    </div>
  );
};
