import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Crown, ExternalLink } from 'lucide-react';
import {
  isNativePlatform,
  getSubscriptionProduct,
  purchaseSubscription,
  manageSubscriptions,
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
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAndroid = isNativePlatform();

  useEffect(() => {
    if (!isAndroid) return;
    getSubscriptionProduct().then(setProductInfo).catch(console.error);
  }, [isAndroid]);

  if (!isAndroid) return null;
  if (isPremium) return null;

  const handlePurchase = async () => {
    if (!user) {
      toast.error(t('premium.loginRequired'));
      return;
    }

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

      // Verify with backend
      const { data, error } = await supabase.functions.invoke('verify-google-subscription', {
        body: {
          purchaseToken: result.purchaseToken,
          productId: '001_01',
          deviceId: getDeviceId(),
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || t('premium.verificationError'));
        setPurchasing(false);
        return;
      }

      setSuccess(true);
      toast.success(t('premium.purchaseSuccess'));
      await checkStatus();
    } catch (err) {
      console.error('Purchase flow error:', err);
      toast.error(t('premium.purchaseError'));
    } finally {
      setPurchasing(false);
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
      <p className="text-xs text-muted-foreground">{t('premium.loginToBuy')}</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('premium.subscribeGoogle')}</p>

      <Button
        onClick={handlePurchase}
        disabled={purchasing}
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

      {isPremium && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={manageSubscriptions}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {t('premium.manageSubscription')}
        </Button>
      )}
    </div>
  );
};
