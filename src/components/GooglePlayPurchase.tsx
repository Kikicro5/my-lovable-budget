import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Smartphone, RotateCcw } from 'lucide-react';
import { purchaseSubscription, restorePurchases, getDeviceId } from '@/services/billing';

export const GooglePlayPurchase = () => {
  const { checkStatus } = usePremium();
  const { t } = useLanguage();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const isAndroid = Capacitor.getPlatform() === 'android';

  const handlePurchase = useCallback(async () => {
    if (!isAndroid) return;
    setPurchasing(true);

    try {
      const result = await purchaseSubscription();

      if (result.error === 'cancelled') return;

      if (!result.success) {
        toast.error(result.error || 'Greška pri kupnji');
        return;
      }

      // Save purchase to database (no Google API verification needed)
      const { data, error } = await supabase.functions.invoke('verify-google-purchase', {
        body: {
          action: 'verify-purchase',
          purchaseToken: result.transactionId,
          productId: '001_01',
          deviceId: getDeviceId(),
        },
      });

      if (error || !data?.success) {
        const detail = data?.error || error?.message || 'Unknown error';
        console.error('Save purchase failed:', detail, { data, error });
        toast.error(`Greška pri spremanju kupnje: ${detail}`);
      } else {
        toast.success(t('premium.purchaseSuccess'));
        await checkStatus();
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('Purchase error:', msg, err);
      toast.error(`Greška pri kupnji: ${msg}`);
    } finally {
      setPurchasing(false);
    }
  }, [isAndroid, checkStatus, t]);

  const handleRestore = useCallback(async () => {
    if (!isAndroid) return;
    setRestoring(true);

    try {
      const result = await restorePurchases();

      if (result.restored && result.activeProducts.includes('001_01')) {
        toast.success(t('premium.purchaseSuccess'));
        await checkStatus();
      } else {
        toast.info(t('premium.noSubscription') || 'Nema aktivnih pretplata');
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      toast.error(`Greška: ${err?.message || String(err)}`);
    } finally {
      setRestoring(false);
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
        disabled={purchasing || restoring}
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
      <Button
        onClick={handleRestore}
        disabled={purchasing || restoring}
        variant="outline"
        className="w-full gap-2"
      >
        {restoring ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        {t('premium.restorePurchases') || 'Vrati kupnje'}
      </Button>
    </div>
  );
};
