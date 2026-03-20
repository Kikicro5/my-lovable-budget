import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ShoppingCart } from 'lucide-react';
import { isNativeAndroid } from '@/utils/platform';

const DEVICE_ID_KEY = 'budget-card-device-id';
const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

// Google Play product ID for the premium annual subscription
const PRODUCT_ID = 'premium_annual';

export const GooglePlayPurchase = () => {
  const { user } = useAuth();
  const { checkStatus } = usePremium();
  const { t } = useLanguage();
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [productPrice, setProductPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isNativeAndroid()) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');
        const { products } = await NativePurchases.getProducts({
          productIdentifiers: [PRODUCT_ID],
          productType: PURCHASE_TYPE.SUBS,
        });
        if (products.length > 0) {
          setProductPrice(products[0].priceString || `${(products[0].price || 3.99).toFixed(2)} €`);
        }
      } catch (err) {
        console.error('Failed to load Google Play product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, []);

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');

      const transaction = await NativePurchases.purchaseProduct({
        productIdentifier: PRODUCT_ID,
        productType: PURCHASE_TYPE.SUBS,
        appAccountToken: user?.id,
      });

      if (transaction) {
        // Verify with backend
        const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
          body: {
            action: 'verify-purchase',
            purchaseToken: transaction.transactionId || PRODUCT_ID,
            productId: PRODUCT_ID,
            deviceId: getDeviceId(),
          },
        });

        if (error || !data?.success) {
          console.error('Backend verification failed:', error || data?.error);
          toast.warning(t('premium.verifyLater') || 'Kupnja uspješna, verifikacija u tijeku...');
        }

        setPurchaseComplete(true);
        toast.success(t('premium.purchaseSuccess') || 'Premium aktiviran!');
        await checkStatus();
      }
    } catch (err: any) {
      if (err?.code === 'PURCHASE_CANCELLED' || err?.message?.includes('cancel')) {
        // User cancelled
      } else {
        console.error('Google Play purchase error:', err);
        toast.error(t('premium.purchaseError') || 'Greška pri kupnji');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!isNativeAndroid()) return null;

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

  if (!user) {
    return (
      <p className="text-xs text-muted-foreground">
        {t('premium.loginToBuy')}
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('premium.buyGooglePlay') || 'Kupite premium putem Google Play-a:'}
      </p>
      <Button
        onClick={handlePurchase}
        disabled={processing}
        className="w-full gap-2"
      >
        {processing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {processing
          ? (t('premium.processing') || 'Obrada...')
          : `${t('premium.buyNow') || 'Kupi Premium'} — ${productPrice || '3,99 €/god'}`}
      </Button>
    </div>
  );
};
