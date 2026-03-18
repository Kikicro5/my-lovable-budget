import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Crown, RotateCcw } from 'lucide-react';
import {
  purchaseSubscription,
  restorePurchases,
} from '@/services/googlePlayBilling';

const DEVICE_ID_KEY = 'budget-card-device-id';
const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

export const GooglePlaySubscription = () => {
  const { user } = useAuth();
  const { isPremium, checkStatus } = usePremium();
  const { t } = useLanguage();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isPremium) return null;

  const verifyWithBackend = async (purchaseToken: string) => {
    const { data, error } = await supabase.functions.invoke('verify-google-subscription', {
      body: {
        purchaseToken,
        productId: '001_01',
        deviceId: getDeviceId(),
      },
    });

    if (error || !data?.success) {
      toast.error(data?.error || t('premium.verificationError'));
      return false;
    }
    return true;
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const result = await purchaseSubscription();

      if (!result.success) {
        if (result.error === 'cancelled') {
          setPurchasing(false);
          return;
        }
        toast.error(result.error || t('premium.purchaseError'));
        setPurchasing(false);
        return;
      }

      if (result.purchaseToken && await verifyWithBackend(result.purchaseToken)) {
        setSuccess(true);
        toast.success(t('premium.purchaseSuccess'));
        await checkStatus();
      }
    } catch (err) {
      console.error('Purchase flow error:', err);
      toast.error(t('premium.purchaseError'));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      toast.error(t('premium.loginRequired'));
      return;
    }

    setRestoring(true);
    try {
      const result = await restorePurchases();

      if (!result.success) {
        toast.error(result.error || t('premium.restoreError') || 'No active subscription found');
        setRestoring(false);
        return;
      }

      if (result.purchaseToken && await verifyWithBackend(result.purchaseToken)) {
        setSuccess(true);
        toast.success(t('premium.purchaseSuccess'));
        await checkStatus();
      }
    } catch (err) {
      console.error('Restore flow error:', err);
      toast.error(t('premium.purchaseError'));
    } finally {
      setRestoring(false);
    }
  };

  if (success) {
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

  if (!user) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground mb-2">{t('premium.loginToBuy')}</p>
        <Button
          onClick={() => toast.error(t('premium.loginRequired'))}
          className="w-full gap-2"
          size="lg"
        >
          <Crown className="w-4 h-4" />
          {t('premium.subscribeButton')}
        </Button>
        <Button
          onClick={() => toast.error(t('premium.loginRequired'))}
          variant="outline"
          className="w-full gap-2"
          size="sm"
        >
          <RotateCcw className="w-4 h-4" />
          {t('premium.restoreSubscription') || 'Obnovi pretplatu'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePurchase}
        disabled={purchasing || restoring}
        className="w-full gap-2"
        size="lg"
      >
        {purchasing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('premium.processing')}
          </>
        ) : (
          <>
            <Crown className="w-4 h-4" />
            {t('premium.subscribeButton')}
          </>
        )}
      </Button>

      <Button
        onClick={handleRestore}
        disabled={purchasing || restoring}
        variant="outline"
        className="w-full gap-2"
        size="sm"
      >
        {restoring ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('premium.processing')}
          </>
        ) : (
          <>
            <RotateCcw className="w-4 h-4" />
            {t('premium.restoreSubscription') || 'Obnovi pretplatu'}
          </>
        )}
      </Button>
    </div>
  );
};
