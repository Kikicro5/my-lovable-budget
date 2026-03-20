import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ShoppingCart } from 'lucide-react';

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
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      // Dynamic import to avoid loading on web
      const { Purchases } = await import('@capgo/native-purchases');

      // Initialize RevenueCat / native purchases
      await Purchases.configure({
        apiKey: 'goog_your_revenuecat_key', // Will be replaced with actual key
      });

      // Get available packages
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering || !currentOffering.availablePackages?.length) {
        toast.error(t('premium.noProducts') || 'Nema dostupnih proizvoda');
        setProcessing(false);
        return;
      }

      // Purchase the first available package (annual)
      const pkg = currentOffering.availablePackages[0];
      const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });

      if (purchaseResult?.customerInfo) {
        // Verify with our backend
        const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
          body: {
            action: 'verify-purchase',
            purchaseToken: pkg.product.identifier,
            productId: pkg.product.identifier,
            deviceId: getDeviceId(),
          },
        });

        if (error || !data?.success) {
          // Even if backend verification fails, the purchase went through
          console.error('Backend verification failed:', error || data?.error);
          toast.warning(t('premium.verifyLater') || 'Kupnja uspješna, verifikacija u tijeku...');
        }

        setPurchaseComplete(true);
        toast.success(t('premium.purchaseSuccess') || 'Premium aktiviran!');
        await checkStatus();
      }
    } catch (err: any) {
      // User cancelled or error
      if (err?.code === 'PURCHASE_CANCELLED' || err?.message?.includes('cancel')) {
        // User cancelled - no error toast
      } else {
        console.error('Google Play purchase error:', err);
        toast.error(t('premium.purchaseError') || 'Greška pri kupnji');
      }
    } finally {
      setProcessing(false);
    }
  };

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
          : (t('premium.buyNow') || 'Kupi Premium — 3,99 €/god')}
      </Button>
    </div>
  );
};
