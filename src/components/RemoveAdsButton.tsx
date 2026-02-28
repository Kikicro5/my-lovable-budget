import { useState, useEffect } from 'react';
import { Ban, Check, Loader2, CreditCard, Calendar, Receipt, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: { layout?: string; color?: string; shape?: string; label?: string; height?: number };
        createOrder: (data: unknown, actions: {
          order: { create: (orderData: { purchase_units: Array<{ amount: { value: string; currency_code: string }; description: string }> }) => Promise<string> };
        }) => Promise<string>;
        onApprove: (data: { orderID: string }, actions: unknown) => Promise<void>;
        onError: (err: Error) => void;
        onCancel: () => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

const PAYPAL_CLIENT_ID = 'AdQbD-v50rs3kZT3thAFYIzDOK38laJKqfSmXzoa562pndYxAXJ7QvKvUJRIvDtN-tyczgnsSN8gOodR';

interface PriceTier {
  id: string;
  price: number;
  duration_days: number;
  currency: string;
}

export const RemoveAdsButton = () => {
  const { t, language } = useLanguage();
  const { isAdFree, isLoading, isPurchasing, expiresAt, daysRemaining, purchases, verifyAndSavePurchase } = useAdFreePurchase();
  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [loadingTiers, setLoadingTiers] = useState(true);

  // Fetch pricing tiers
  useEffect(() => {
    const fetchTiers = async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('*')
        .order('duration_days', { ascending: true });

      if (!error && data && data.length > 0) {
        setTiers(data);
        // Default select middle tier (3 months) or first
        const defaultTier = data.length >= 2 ? data[1] : data[0];
        setSelectedTier(defaultTier);
      }
      setLoadingTiers(false);
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    if (showPayPal && !paypalLoaded && selectedTier) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${selectedTier.currency}`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);

      return () => {
        const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
        if (existingScript) document.body.removeChild(existingScript);
      };
    }
  }, [showPayPal, paypalLoaded, selectedTier]);

  useEffect(() => {
    if (paypalLoaded && showPayPal && window.paypal && selectedTier) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 45 },
          createOrder: async (_data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: selectedTier.price.toFixed(2), currency_code: selectedTier.currency },
                description: `Budget Card Premium - ${getTierLabel(selectedTier.id)}`,
              }],
            });
          },
          onApprove: async (data) => {
            const success = await verifyAndSavePurchase(data.orderID, selectedTier.id);
            if (success) {
              toast.success(t('removeAds.success') || 'Premium activated! Thank you for your purchase.');
              setShowPayPal(false);
              window.dispatchEvent(new Event('premium-status-changed'));
              window.dispatchEvent(new Event('ad-free-purchased'));
            } else {
              toast.error(t('removeAds.error') || 'Payment verification failed. Please contact support.');
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            toast.error(t('removeAds.error') || 'Payment failed. Please try again.');
          },
          onCancel: () => {
            toast.info(t('removeAds.cancelled') || 'Payment cancelled.');
          },
        }).render('#paypal-button-container');
      }
    }
  }, [paypalLoaded, showPayPal, verifyAndSavePurchase, t, selectedTier]);

  const getTierLabel = (id: string): string => {
    const key = `removeAds.tier.${id}`;
    const translated = t(key);
    return translated !== key ? translated : id;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(language === 'hr' ? 'hr-HR' : language === 'de' ? 'de-DE' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'hr' ? 'hr-HR' : language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency', currency,
    }).format(amount);
  };

  const getSavingsPercent = (tier: PriceTier): number | null => {
    if (tiers.length === 0) return null;
    const monthlyRate = tiers[0]?.price || 0;
    if (monthlyRate === 0) return null;
    const months = tier.duration_days / 30;
    const fullPrice = monthlyRate * months;
    if (tier.price >= fullPrice) return null;
    return Math.round(((fullPrice - tier.price) / fullPrice) * 100);
  };

  const PaymentHistory = () => {
    if (purchases.length === 0) return null;
    return (
      <>
        <Separator className="my-4" />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <span>{t('removeAds.paymentHistory') || 'Payment History'}</span>
          </div>
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-foreground font-medium">{formatDate(purchase.purchased_at)}</div>
                    <div className="text-muted-foreground text-xs">
                      {t('removeAds.validUntil') || 'Valid until'}: {formatDate(purchase.expires_at)}
                    </div>
                    {purchase.paypal_order_id && (
                      <div className="text-muted-foreground text-xs font-mono">ID: {purchase.paypal_order_id}</div>
                    )}
                  </div>
                  <div className="text-foreground font-semibold">
                    {purchase.amount && purchase.currency ? formatCurrency(purchase.amount, purchase.currency) : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  if (isLoading || loadingTiers) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Already premium
  if (isAdFree && expiresAt) {
    return (
      <div className="bg-card rounded-xl p-4 border border-primary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('removeAds.purchased') || 'Premium Active'}</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{daysRemaining}</span>
            <span className="text-xs">{t('removeAds.daysShort') || 'd'}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{t('removeAds.thankYou') || 'Thank you! Premium is active.'}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Calendar className="w-4 h-4" />
          <span>{t('removeAds.expiresOn') || 'Expires on'}: {formatDate(expiresAt)} ({daysRemaining} {t('removeAds.daysLeft') || 'days left'})</span>
        </div>
        {daysRemaining !== null && daysRemaining <= 30 && (
          <>
            {/* Tier selection for renewal */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {tiers.map(tier => {
                const savings = getSavingsPercent(tier);
                return (
                  <button
                    key={tier.id}
                    onClick={() => { setSelectedTier(tier); setPaypalLoaded(false); }}
                    className={cn(
                      "relative border rounded-lg p-3 text-center transition-all",
                      selectedTier?.id === tier.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {savings && savings > 0 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                        -{savings}%
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground">{getTierLabel(tier.id)}</p>
                    <p className="text-base font-bold text-foreground mt-1">{formatCurrency(tier.price, tier.currency)}</p>
                  </button>
                );
              })}
            </div>
            <Button onClick={() => setShowPayPal(true)} className="w-full gap-2 mt-3" variant="outline">
              <CreditCard className="w-4 h-4" />
              {t('removeAds.renew') || 'Renew Subscription'}
            </Button>
          </>
        )}
        {showPayPal && (
          <div className="space-y-3 mt-3">
            <div id="paypal-button-container" className="min-h-[50px]">
              {!paypalLoaded && <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
            </div>
            <Button variant="outline" onClick={() => setShowPayPal(false)} className="w-full">{t('dialog.cancel') || 'Cancel'}</Button>
          </div>
        )}
        <PaymentHistory />
      </div>
    );
  }

  // Not premium - show tier selection
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{t('removeAds.title') || 'Get Premium'}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t('removeAds.description') || 'Unlock all features with a premium subscription.'}</p>

      {/* Tier cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {tiers.map(tier => {
          const savings = getSavingsPercent(tier);
          const isPopular = tier.id === '3months';
          return (
            <button
              key={tier.id}
              onClick={() => { setSelectedTier(tier); setPaypalLoaded(false); }}
              className={cn(
                "relative border rounded-lg p-3 text-center transition-all",
                selectedTier?.id === tier.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40",
                isPopular && "ring-1 ring-primary/30"
              )}
            >
              {isPopular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                  ⭐ {t('removeAds.popular') || 'Popular'}
                </span>
              )}
              {savings && savings > 0 && !isPopular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                  -{savings}%
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-1">{getTierLabel(tier.id)}</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(tier.price, tier.currency)}</p>
              {tier.duration_days > 30 && (
                <p className="text-[10px] text-muted-foreground">
                  {formatCurrency(tier.price / (tier.duration_days / 30), tier.currency)}/{t('removeAds.perMonth') || 'mo'}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {!showPayPal ? (
        <Button
          onClick={() => setShowPayPal(true)}
          className="w-full gap-2"
          disabled={isPurchasing || !selectedTier}
        >
          <CreditCard className="w-4 h-4" />
          {selectedTier
            ? `${t('removeAds.subscribe') || 'Subscribe'} - ${formatCurrency(selectedTier.price, selectedTier.currency)}`
            : t('removeAds.selectPlan') || 'Select a plan'}
        </Button>
      ) : (
        <div className="space-y-3">
          <div id="paypal-button-container" className="min-h-[50px]">
            {!paypalLoaded && <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
          </div>
          <Button variant="outline" onClick={() => setShowPayPal(false)} className="w-full">{t('dialog.cancel') || 'Cancel'}</Button>
        </div>
      )}

      <PaymentHistory />
    </div>
  );
};
