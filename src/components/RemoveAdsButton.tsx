import { useState, useEffect } from 'react';
import { Star, Check, Loader2, CreditCard, Calendar, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          shape?: string;
          color?: string;
          layout?: string;
          label?: string;
          height?: number;
        };
        createSubscription: (data: unknown, actions: {
          subscription: {
            create: (data: { plan_id: string }) => Promise<string>;
          };
        }) => Promise<string>;
        onApprove: (data: { subscriptionID: string }) => void;
        onError: (err: Error) => void;
        onCancel: () => void;
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

const PAYPAL_CLIENT_ID = 'ASpt2jlHKdbl5GJzyE_3bcekUqIjmZmQUHrpCaLyPFfE2pJahcj3-FpmIdLRVNMgyAs5MmbJ76tQ46zr';
const PLAN_ID = 'P-0P871569YS189500HNGLTFOQ';
const PRICE = '6.99';
const CURRENCY = 'EUR';

export const RemoveAdsButton = () => {
  const { t, language } = useLanguage();
  const { isAdFree, isLoading, isPurchasing, expiresAt, daysRemaining, purchases, verifyAndSavePurchase } = useAdFreePurchase();
  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    if (showPayPal && !paypalLoaded) {
      // Remove any existing PayPal script first
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.setAttribute('data-sdk-integration-source', 'button-factory');
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);

      return () => {
        const s = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
        if (s) s.remove();
      };
    }
  }, [showPayPal, paypalLoaded]);

  useEffect(() => {
    if (paypalLoaded && showPayPal && window.paypal) {
      const containerId = `paypal-button-container-${PLAN_ID}`;
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';

        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
            height: 45,
          },
          createSubscription: (_data, actions) => {
            return actions.subscription.create({ plan_id: PLAN_ID });
          },
          onApprove: async (data) => {
            const success = await verifyAndSavePurchase(data.subscriptionID);
            if (success) {
              toast.success(t('removeAds.success') || 'Premium aktiviran! Hvala na pretplati.');
              setShowPayPal(false);
            } else {
              toast.error(t('removeAds.error') || 'Verifikacija nije uspjela. Kontaktiraj podršku.');
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            toast.error(t('removeAds.error') || 'Greška pri plaćanju. Pokušaj ponovo.');
          },
          onCancel: () => {
            toast.info(t('removeAds.cancelled') || 'Plaćanje otkazano.');
          },
        }).render(`#${containerId}`);
      }
    }
  }, [paypalLoaded, showPayPal, verifyAndSavePurchase, t]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(language === 'hr' ? 'hr-HR' : language === 'de' ? 'de-DE' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'hr' ? 'hr-HR' : language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const PaymentHistory = () => {
    if (purchases.length === 0) return null;
    return (
      <>
        <Separator className="my-4" />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <span>{t('removeAds.paymentHistory') || 'Povijest pretplate'}</span>
          </div>
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-foreground font-medium">{formatDate(purchase.purchased_at)}</div>
                    <div className="text-muted-foreground text-xs">
                      {t('removeAds.validUntil') || 'Vrijedi do'}: {formatDate(purchase.expires_at)}
                    </div>
                    {purchase.paypal_order_id && (
                      <div className="text-muted-foreground text-xs font-mono">
                        ID: {purchase.paypal_order_id}
                      </div>
                    )}
                  </div>
                  <div className="text-foreground font-semibold">
                    {purchase.amount && purchase.currency
                      ? formatCurrency(purchase.amount, purchase.currency)
                      : `€${PRICE}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isAdFree && expiresAt) {
    return (
      <div className="bg-card rounded-xl p-4 border border-primary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t('removeAds.purchased') || 'Premium verzija aktivna'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{daysRemaining}</span>
            <span className="text-xs">{t('removeAds.daysShort') || 'd'}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {t('removeAds.thankYou') || 'Hvala na pretplati! Uživaj u svim Premium značajkama.'}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Calendar className="w-4 h-4" />
          <span>
            {t('removeAds.expiresOn') || 'Vrijedi do'}: {formatDate(expiresAt)}
            ({daysRemaining} {t('removeAds.daysLeft') || 'dana'})
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          {daysRemaining !== null && daysRemaining <= 30 && (
            <Button
              onClick={() => setShowPayPal(true)}
              className="flex-1 gap-2"
              variant="outline"
            >
              <CreditCard className="w-4 h-4" />
              {t('removeAds.renew') || 'Obnovi pretplatu'}
            </Button>
          )}
          <Button
            asChild
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground"
          >
            <a
              href="https://www.paypal.com/myaccount/autopay"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('removeAds.cancelSubscription') || 'Otkaži pretplatu'}
            </a>
          </Button>
        </div>
        {showPayPal && (
          <div className="space-y-3 mt-3">
            <div id={`paypal-button-container-${PLAN_ID}`} className="min-h-[50px]">
              {!paypalLoaded && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowPayPal(false)} className="w-full">
              {t('dialog.cancel') || 'Odustani'}
            </Button>
          </div>
        )}
        <PaymentHistory />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {t('removeAds.title') || 'Premium verzija'}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t('removeAds.description') || 'Otključaj napredne značajke s godišnjom pretplatom.'}
      </p>

      {/* Feature list */}
      <ul className="space-y-1.5 mb-4">
        {[
          t('monthly.investment') || 'Investicije',
          t('monthly.savings') || 'Štednja',
          t('limits.title') || 'Limiti rashoda',
          t('accounts.transfer') || 'Prijenos između računa',
          'Pregled po mjesecima',
        ].map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {!showPayPal ? (
        <Button
          onClick={() => setShowPayPal(true)}
          className="w-full gap-2 bg-primary text-primary-foreground"
          disabled={isPurchasing}
        >
          <CreditCard className="w-4 h-4" />
          {t('removeAds.buyButton') || `Otključaj Premium - €${PRICE}/god`}
        </Button>
      ) : (
        <div className="space-y-3">
          <div id={`paypal-button-container-${PLAN_ID}`} className="min-h-[50px]">
            {!paypalLoaded && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => setShowPayPal(false)} className="w-full">
            {t('dialog.cancel') || 'Odustani'}
          </Button>
        </div>
      )}

      <PaymentHistory />
    </div>
  );
};
