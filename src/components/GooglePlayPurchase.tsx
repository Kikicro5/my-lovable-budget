import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ShoppingCart, Gift, RotateCcw } from 'lucide-react';
import { isNativeAndroid } from '@/utils/platform';
import {
  purchaseSubscription,
  purchaseTrial,
  restorePurchases,
  getProducts,
  type BillingProduct,
} from '@/services/billing';

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
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isNativeAndroid()) {
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        const loaded = await getProducts();
        setProducts(loaded);
      } catch (err) {
        console.error('Failed to load Google Play products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const verifyWithBackend = async (transaction: any, productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
        body: {
          action: 'verify-purchase',
          purchaseToken: transaction?.transactionId || productId,
          productId,
          deviceId: getDeviceId(),
        },
      });

      if (error || !data?.success) {
        console.error('Backend verification failed:', error || data?.error);
        toast.warning('Kupnja uspješna, verifikacija u tijeku...');
      }
    } catch (err) {
      console.error('Backend verification error:', err);
    }
  };

  const handleSubscription = async () => {
    setProcessingAction('subscribe');
    try {
      const result = await purchaseSubscription(user?.id);

      if (result.success && result.transaction) {
        await verifyWithBackend(result.transaction, '001_01');
        setPurchaseComplete(true);
        toast.success('Premium aktiviran!');
        await checkStatus();
      } else if (result.error) {
        if (result.error.code !== 'CANCELLED') {
          toast.error(result.error.userMessage);
        }
      }
    } finally {
      setProcessingAction(null);
    }
  };

  const handleTrial = async () => {
    setProcessingAction('trial');
    try {
      const result = await purchaseTrial(user?.id);

      if (result.success && result.transaction) {
        await verifyWithBackend(result.transaction, '001-02');
        setPurchaseComplete(true);
        toast.success('Probno razdoblje aktivirano!');
        await checkStatus();
      } else if (result.error) {
        if (result.error.code !== 'CANCELLED') {
          toast.error(result.error.userMessage);
        }
      }
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRestore = async () => {
    setProcessingAction('restore');
    try {
      const result = await restorePurchases();

      if (result.success && result.restored > 0) {
        toast.success('Pretplata uspješno obnovljena!');
        await checkStatus();
      } else if (result.success && result.restored === 0) {
        toast.info('Nema pronađenih prethodnih kupnji.');
      } else if (result.error) {
        toast.error(result.error.userMessage);
      }
    } finally {
      setProcessingAction(null);
    }
  };

  if (!isNativeAndroid()) return null;

  if (purchaseComplete) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
        <CheckCircle className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium text-sm text-foreground">Premium aktiviran!</p>
          <p className="text-xs text-muted-foreground">Uživajte u svim značajkama.</p>
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

  const subProduct = products.find(p => p.identifier === '001_01');
  const trialProduct = products.find(p => p.identifier === '001-02');

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Kupite premium putem Google Play-a:
      </p>

      {/* Subscription button */}
      <Button
        onClick={handleSubscription}
        disabled={!!processingAction}
        className="w-full gap-2"
      >
        {processingAction === 'subscribe' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {processingAction === 'subscribe'
          ? 'Obrada...'
          : `Pretplatite se putem Google Play-a — ${subProduct?.priceString || '3,99 €/god'}`}
      </Button>

      {/* Trial button */}
      <Button
        onClick={handleTrial}
        disabled={!!processingAction}
        variant="outline"
        className="w-full gap-2"
      >
        {processingAction === 'trial' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Gift className="w-4 h-4" />
        )}
        {processingAction === 'trial'
          ? 'Obrada...'
          : `Isprobaj 14 dana besplatno${trialProduct ? ` — ${trialProduct.priceString}` : ''}`}
      </Button>

      {/* Restore button */}
      <Button
        onClick={handleRestore}
        disabled={!!processingAction}
        variant="ghost"
        className="w-full gap-2 text-muted-foreground"
      >
        {processingAction === 'restore' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        {processingAction === 'restore' ? 'Obnavljanje...' : 'Obnovi pretplatu'}
      </Button>
    </div>
  );
};
