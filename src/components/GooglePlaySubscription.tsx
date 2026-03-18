import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Crown, LogIn } from 'lucide-react';
import {
  isNativePlatform,
  getSubscriptionProduct,
  purchaseSubscription,
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

const isAndroidDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
};

export const GooglePlaySubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, checkStatus } = usePremium();
  const { t } = useLanguage();
  const [productInfo, setProductInfo] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  const isNativeAndroid = isNativePlatform();
  const shouldShowSubscription = isNativeAndroid || isAndroidDevice();

  useEffect(() => {
    if (!isNativeAndroid) return;
    getSubscriptionProduct().then(setProductInfo).catch(console.error);
  }, [isNativeAndroid]);

  if (!shouldShowSubscription || isPremium) return null;

  const buttonLabel = productInfo?.localizedPrice
    ? `${t('premium.subscribeButton')} • ${productInfo.localizedPrice}`
    : t('premium.subscribeButton');

  const handlePurchase = async () => {
    if (!isNativeAndroid) {
      toast.error(t('premium.purchaseError'));
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchaseSubscription();

      if (!result.success) {
        if (result.error === 'cancelled') {
          return;
        }

        toast.error(result.error || t('premium.purchaseError'));
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-google-subscription', {
        body: {
          purchaseToken: result.purchaseToken,
          productId: '001_01',
          deviceId: getDeviceId(),
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || t('premium.verificationError'));
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
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
        <CheckCircle className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">{t('premium.purchaseSuccess')}</p>
          <p className="text-xs text-muted-foreground">{t('premium.purchaseActivated')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">{t('premium.loginToBuy')}</p>
        <Button onClick={() => navigate('/auth')} className="w-full gap-2" size="lg">
          <LogIn className="h-4 w-4" />
          {t('auth.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('premium.subscribeGoogle')}</p>
      <Button
        onClick={handlePurchase}
        disabled={purchasing || !isNativeAndroid}
        className="w-full gap-2"
        size="lg"
      >
        {purchasing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('premium.processing')}
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </Button>
    </div>
  );
};
