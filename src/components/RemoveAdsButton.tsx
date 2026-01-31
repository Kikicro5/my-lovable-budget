import { useState, useEffect } from 'react';
import { Ban, Check, Loader2, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';
import { toast } from 'sonner';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          layout?: string;
          color?: string;
          shape?: string;
          label?: string;
          height?: number;
        };
        createOrder: (data: unknown, actions: {
          order: {
            create: (orderData: {
              purchase_units: Array<{
                amount: { value: string; currency_code: string };
                description: string;
              }>;
            }) => Promise<string>;
          };
        }) => Promise<string>;
        onApprove: (data: { orderID: string }, actions: unknown) => Promise<void>;
        onError: (err: Error) => void;
        onCancel: () => void;
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

const PAYPAL_CLIENT_ID = 'AdQbD-v50rs3kZT3thAFYIzDOK38laJKqfSmXzoa562pndYxAXJ7QvKvUJRIvDtN-tyczgnsSN8gOodR';
const PRICE = '2.99';
const CURRENCY = 'EUR';

export const RemoveAdsButton = () => {
  const { t, language } = useLanguage();
  const { isAdFree, isLoading, isPurchasing, expiresAt, daysRemaining, verifyAndSavePurchase } = useAdFreePurchase();
  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    if (showPayPal && !paypalLoaded) {
      // Load PayPal SDK
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${CURRENCY}`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [showPayPal, paypalLoaded]);

  useEffect(() => {
    if (paypalLoaded && showPayPal && window.paypal) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 45,
          },
          createOrder: async (_data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: PRICE,
                  currency_code: CURRENCY,
                },
                description: 'Budget Card - Remove Ads (1 Year)',
              }],
            });
          },
          onApprove: async (data) => {
            const success = await verifyAndSavePurchase(data.orderID);
            if (success) {
              toast.success(t('removeAds.success') || 'Ads removed successfully! Thank you for your purchase.');
              setShowPayPal(false);
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
  }, [paypalLoaded, showPayPal, verifyAndSavePurchase, t]);

  // Format expiration date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'hr' ? 'hr-HR' : language === 'de' ? 'de-DE' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
              {t('removeAds.purchased') || 'Ad-Free Version'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{daysRemaining}</span>
            <span className="text-xs">{t('removeAds.daysShort') || 'd'}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {t('removeAds.thankYou') || 'Thank you for your purchase! You are using the ad-free version.'}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Calendar className="w-4 h-4" />
          <span>
            {t('removeAds.expiresOn') || 'Expires on'}: {formatDate(expiresAt)} 
            ({daysRemaining} {t('removeAds.daysLeft') || 'days left'})
          </span>
        </div>
        {daysRemaining !== null && daysRemaining <= 30 && (
          <Button 
            onClick={() => setShowPayPal(true)} 
            className="w-full gap-2 mt-3"
            variant="outline"
          >
            <CreditCard className="w-4 h-4" />
            {t('removeAds.renew') || 'Renew Subscription'}
          </Button>
        )}
        
        {showPayPal && (
          <div className="space-y-3 mt-3">
            <div id="paypal-button-container" className="min-h-[50px]">
              {!paypalLoaded && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPayPal(false)} 
              className="w-full"
            >
              {t('dialog.cancel') || 'Cancel'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Ban className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {t('removeAds.title') || 'Remove Ads'}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {t('removeAds.description') || 'Enjoy an ad-free experience with an annual subscription.'}
      </p>
      
      {!showPayPal ? (
        <Button 
          onClick={() => setShowPayPal(true)} 
          className="w-full gap-2"
          disabled={isPurchasing}
        >
          <CreditCard className="w-4 h-4" />
          {t('removeAds.buyButton') || `Remove Ads - €${PRICE}/year`}
        </Button>
      ) : (
        <div className="space-y-3">
          <div id="paypal-button-container" className="min-h-[50px]">
            {!paypalLoaded && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowPayPal(false)} 
            className="w-full"
          >
            {t('dialog.cancel') || 'Cancel'}
          </Button>
        </div>
      )}
    </div>
  );
};
