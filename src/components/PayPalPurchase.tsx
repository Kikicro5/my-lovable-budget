import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

interface PriceTier {
  id: string;
  price: number;
  currency: string;
  duration_days: number;
}

const DEVICE_ID_KEY = 'budget-card-device-id';
const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

let cachedConfig: { clientId: string; prices: PriceTier[] } | null = null;
let configPromise: Promise<typeof cachedConfig> | null = null;

const fetchConfigOnce = async (): Promise<typeof cachedConfig> => {
  if (cachedConfig) return cachedConfig;
  if (!configPromise) {
    configPromise = (async () => {
      for (let i = 0; i < 3; i++) {
        try {
          const { data, error } = await supabase.functions.invoke('paypal-checkout', {
            body: { action: 'get-config' },
          });
          if (!error && data) {
            cachedConfig = { clientId: data.clientId, prices: data.prices || [] };
            return cachedConfig;
          }
        } catch { /* retry */ }
        if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
      configPromise = null;
      return null;
    })();
  }
  return configPromise;
};

export const PayPalPurchase = () => {
  const { user, isAdmin } = useAuth();
  const { checkStatus } = usePremium();
  const { t } = useLanguage();
  const checkStatusRef = useRef(checkStatus);
  checkStatusRef.current = checkStatus;
  const [prices, setPrices] = useState<PriceTier[]>(cachedConfig?.prices || []);
  const [sdkReady, setSdkReady] = useState(!!(window as any).paypal);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [loading, setLoading] = useState(!cachedConfig);
  const paypalRef = useRef<HTMLDivElement>(null);

  const availableTiers = useMemo(() => prices.filter(t => t.price > 0), [prices]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    if (availableTiers.length > 0 && !selectedTier) {
      setSelectedTier(availableTiers[0].id);
    }
  }, [availableTiers, selectedTier]);

  useEffect(() => {
    if (cachedConfig) {
      setPrices(cachedConfig.prices);
      setLoading(false);
      return;
    }
    fetchConfigOnce().then((config) => {
      if (config) {
        setPrices(config.prices);
      }
      setLoading(false);
    });
  }, []);

  const paypalClientId = cachedConfig?.clientId || null;
  useEffect(() => {
    if (!paypalClientId) return;
    if ((window as any).paypal) {
      setSdkReady(true);
      return;
    }
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&intent=capture`;
    script.onload = () => setSdkReady(true);
    script.onerror = () => console.error('Failed to load PayPal SDK');
    document.body.appendChild(script);
  }, [paypalClientId]);

  useEffect(() => {
    if (!sdkReady || !selectedTier || !user || processing || purchaseComplete) return;
    if (!paypalRef.current) return;

    const paypal = (window as any).paypal;
    if (!paypal) return;

    const container = paypalRef.current;
    container.innerHTML = '';

    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 40 },
      createOrder: async () => {
        const { data, error } = await supabase.functions.invoke('paypal-checkout', {
          body: { action: 'create-order', priceId: selectedTier },
        });
        if (error || !data?.orderId) {
          toast.error(t('premium.orderError'));
          throw new Error('Failed to create order');
        }
        return data.orderId;
      },
      onApprove: async (data: any) => {
        setProcessing(true);
        try {
          const { data: captureData, error } = await supabase.functions.invoke('paypal-checkout', {
            body: {
              action: 'capture-order',
              orderId: data.orderID,
              priceId: selectedTier,
              deviceId: getDeviceId(),
            },
          });
          if (error || !captureData?.success) {
            throw new Error(captureData?.error || 'Capture failed');
          }
          setPurchaseComplete(true);
          toast.success(t('premium.activatedDays').replace('{days}', String(captureData.durationDays)));
          await checkStatusRef.current();
        } catch (err) {
          console.error('Capture error:', err);
          toast.error(t('premium.captureError'));
        } finally {
          setProcessing(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast.error(t('premium.paypalError'));
      },
    }).render(container);
  }, [sdkReady, selectedTier, user, processing, purchaseComplete]);

  const durationLabel = (days: number): string => {
    if (days <= 31) return t('premium.month1');
    if (days <= 92) return t('premium.months3');
    return t('premium.months12');
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

  if (!user) {
    return (
      <p className="text-xs text-muted-foreground">
        {t('premium.loginToBuy')}
      </p>
    );
  }

  if (availableTiers.length === 0) {
    return null;
  }

  const showGrid = availableTiers.length > 1;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {showGrid ? t('premium.buyOptions') : t('premium.buyAnnual')}
      </p>

      {showGrid ? (
        <div className={`grid grid-cols-${availableTiers.length} gap-2`}>
          {availableTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative p-3 rounded-lg border text-center transition-all ${
                selectedTier === tier.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {tier.duration_days >= 365 ? (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                  {t('premium.bestPrice')}
                </Badge>
              ) : tier.duration_days >= 90 ? (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-accent text-accent-foreground">
                  -15%
                </Badge>
              ) : null}
              <p className="text-xs text-muted-foreground">{durationLabel(tier.duration_days)}</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {tier.price.toFixed(2)}€
              </p>
              {tier.duration_days >= 365 && (
                <p className="text-[10px] text-primary mt-0.5">
                  {t('premium.perMonth').replace('{price}', (tier.price / 12).toFixed(2))}
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-primary bg-primary/10 text-center">
          <p className="text-xs text-muted-foreground">{durationLabel(availableTiers[0].duration_days)}</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {availableTiers[0].price.toFixed(2)}€
          </p>
          <p className="text-xs text-primary mt-0.5">
            {t('premium.perMonth').replace('{price}', (availableTiers[0].price / 12).toFixed(2))}
          </p>
        </div>
      )}

      {processing ? (
        <div className="flex items-center justify-center gap-2 p-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{t('premium.processing')}</span>
        </div>
      ) : (
        <div ref={paypalRef} className="min-h-[45px]" />
      )}
    </div>
  );
};
