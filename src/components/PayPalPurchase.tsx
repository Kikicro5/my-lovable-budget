import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
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

const durationLabel = (days: number): string => {
  if (days <= 31) return '1 mjesec';
  if (days <= 92) return '3 mjeseca';
  return '12 mjeseci';
};

export const PayPalPurchase = () => {
  const { user } = useAuth();
  const { checkStatus } = usePremium();
  const [prices, setPrices] = useState<PriceTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('paypal-checkout', {
          body: { action: 'get-config' },
        });
        if (!error && data) {
          setPrices(data.prices || []);
          setPaypalClientId(data.clientId);
          if (data.prices?.length > 0) {
            setSelectedTier(data.prices[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Load PayPal SDK
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

  // Render PayPal buttons when SDK is ready and tier selected
  useEffect(() => {
    if (!sdkReady || !selectedTier || !user || processing || purchaseComplete) return;
    if (!paypalRef.current) return;

    const paypal = (window as any).paypal;
    if (!paypal) return;

    // Clear previous buttons
    paypalRef.current.innerHTML = '';
    buttonsRendered.current = true;

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        height: 40,
      },
      createOrder: async () => {
        const { data, error } = await supabase.functions.invoke('paypal-checkout', {
          body: { action: 'create-order', priceId: selectedTier },
        });
        if (error || !data?.orderId) {
          toast.error('Greška pri kreiranju narudžbe');
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
          toast.success(`Premium aktiviran na ${captureData.durationDays} dana!`);
          await checkStatus();
        } catch (err) {
          console.error('Capture error:', err);
          toast.error('Greška pri obradi plaćanja. Kontaktirajte podršku.');
        } finally {
          setProcessing(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast.error('Greška s PayPal-om');
      },
    }).render(paypalRef.current);
  }, [sdkReady, selectedTier, user, processing, purchaseComplete, checkStatus]);

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
          <p className="font-medium text-sm text-foreground">Kupnja uspješna!</p>
          <p className="text-xs text-muted-foreground">Premium je aktiviran.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-xs text-muted-foreground">
        Prijavite se za kupovinu premium pristupa.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Ili kupite premium pristup putem PayPal-a:</p>

      {/* Tier selection */}
      <div className="grid grid-cols-3 gap-2">
        {prices.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`relative p-3 rounded-lg border text-center transition-all ${
              selectedTier === tier.id
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            {tier.duration_days >= 365 && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                Najbolja
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">{durationLabel(tier.duration_days)}</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {tier.price.toFixed(2)}€
            </p>
            {tier.duration_days >= 365 && (
              <p className="text-[10px] text-primary mt-0.5">
                {(tier.price / 12).toFixed(2)}€/mj
              </p>
            )}
          </button>
        ))}
      </div>

      {/* PayPal buttons */}
      {processing ? (
        <div className="flex items-center justify-center gap-2 p-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Obrada plaćanja...</span>
        </div>
      ) : (
        <div ref={paypalRef} className="min-h-[45px]" />
      )}
    </div>
  );
};
