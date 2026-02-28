import { format } from 'date-fns';
import { Crown, Sparkles, Key, LogIn, ShoppingCart, Loader2, Check, TrendingUp, PiggyBank, BarChart3, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePremiumContext, getDeviceId } from '@/contexts/PremiumContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

type PriceTier = '1m' | '3m' | '12m';

const TIER_DAYS: Record<PriceTier, number> = { '1m': 30, '3m': 90, '12m': 365 };

export function PremiumBanner() {
  const { isPremium, validUntil, activateCode, recheckStatus } = usePremiumContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PriceTier>('1m');
  const [prices, setPrices] = useState<Record<PriceTier, string>>({ '1m': '', '3m': '', '12m': '' });
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);

  // Fetch prices
  useEffect(() => {
    if (isPremium) return;
    const fetchPrices = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('paypal-checkout', {
          body: { action: 'get-prices' },
        });
        if (!error && data) {
          setPrices({ '1m': data.price_1m, '3m': data.price_3m, '12m': data.price_12m });
          setPaypalClientId(data.clientId);
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err);
      }
    };
    fetchPrices();
  }, [isPremium]);

  // Load PayPal SDK
  useEffect(() => {
    if (!paypalClientId || !showPaypal) return;
    const existingScript = document.querySelector('script[data-paypal-sdk]');
    if (existingScript) {
      if ((window as any).paypal) setPaypalReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR`;
    script.setAttribute('data-paypal-sdk', 'true');
    script.onload = () => setPaypalReady(true);
    document.head.appendChild(script);
  }, [paypalClientId, showPaypal]);

  // Render PayPal buttons
  const renderPayPalButtons = useCallback(() => {
    const container = document.getElementById('paypal-button-container-banner');
    if (!container) return;
    container.innerHTML = '';

    const paypal = (window as any).paypal;
    if (!paypal) return;

    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 40 },
      createOrder: async () => {
        setPaypalLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('paypal-checkout', {
            body: { action: 'create-order', tier: selectedTier },
          });
          if (error || !data?.id) throw new Error('Failed to create order');
          return data.id;
        } catch (err) {
          setPaypalLoading(false);
          toast.error(String(err));
          throw err;
        }
      },
      onApprove: async (data: any) => {
        try {
          const deviceId = getDeviceId();
          const { data: result, error } = await supabase.functions.invoke('paypal-checkout', {
            body: { action: 'capture-order', order_id: data.orderID, device_id: deviceId, tier: selectedTier },
          });
          if (error || !result?.success) throw new Error(result?.error || 'Capture failed');
          await recheckStatus();
          window.dispatchEvent(new CustomEvent('subscription-changed', { detail: { isPremium: true } }));
          toast.success(t('activate.success'));
          setShowPaypal(false);
        } catch (err) {
          toast.error(String(err));
        } finally {
          setPaypalLoading(false);
        }
      },
      onCancel: () => setPaypalLoading(false),
      onError: (err: any) => { setPaypalLoading(false); console.error('PayPal error:', err); },
    }).render('#paypal-button-container-banner');
  }, [selectedTier, t, recheckStatus]);

  useEffect(() => {
    if (paypalReady && showPaypal) renderPayPalButtons();
  }, [paypalReady, showPaypal, selectedTier, renderPayPalButtons]);

  // Not logged in
  if (!user) {
    const monthlyPrice = parseFloat(prices['1m']);
    return (
      <div className="relative overflow-hidden rounded-xl p-3 sm:p-4 border shadow-sm animate-fade-in bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/40 dark:border-amber-700/50">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-300/30 dark:shadow-amber-700/30">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              {t('activate.title')}
            </span>
          </div>

          {/* Tier prices for non-logged-in users */}
          <div className="grid grid-cols-3 gap-2">
            {(['1m', '3m', '12m'] as PriceTier[]).map((tier) => {
              const price = prices[tier];
              const label = t(`premium.tier_${tier}`);
              let savingsPercent = 0;
              const tierPrice = parseFloat(price);
              if (monthlyPrice > 0 && tierPrice > 0) {
                const months = tier === '3m' ? 3 : tier === '12m' ? 12 : 1;
                const fullPrice = monthlyPrice * months;
                savingsPercent = Math.round(((fullPrice - tierPrice) / fullPrice) * 100);
              }
              return (
                <div key={tier} className="relative rounded-lg border border-amber-200 dark:border-amber-700/50 p-2 text-center">
                  {savingsPercent > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      -{savingsPercent}%
                    </span>
                  )}
                  <div className="text-xs font-medium text-foreground">{label}</div>
                  {price && <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{price}€</div>}
                </div>
              );
            })}
          </div>

          {/* Premium features list */}
          <div className="grid grid-cols-1 gap-1.5 text-xs text-amber-800 dark:text-amber-200/80">
            {[
              { icon: BarChart3, key: 'premium.featureLimits' },
              { icon: TrendingUp, key: 'premium.featureCharts' },
              { icon: PiggyBank, key: 'premium.featureSavings' },
              { icon: ArrowLeftRight, key: 'premium.featureTransfers' },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {t('activate.title')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border shadow-sm animate-fade-in ${
      isPremium
        ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/40 dark:border-amber-700/50'
        : 'bg-gradient-to-r from-slate-50 via-card to-slate-100 border-border dark:from-slate-900/50 dark:via-card dark:to-slate-800/50'
    }`}>
      {isPremium && (
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${
            isPremium
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-300/30 dark:shadow-amber-700/30'
              : 'bg-muted'
          }`}>
            <Crown className={`w-4 h-4 ${isPremium ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          </div>

          {isPremium ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium truncate">
                {t('activate.activated')}
                {validUntil && (
                  <span className="text-amber-600/70 dark:text-amber-400/70 font-normal">
                    {' '}— {t('premium.validUntil')} {format(new Date(validUntil), 'dd.MM.yyyy')}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input
                placeholder="XXXX-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono text-center text-sm tracking-wider h-8 flex-1 border focus-visible:border-amber-400"
              />
              <Button
                size="sm"
                disabled={activating || !code.trim()}
                onClick={async () => {
                  if (!code.trim()) return;
                  setActivating(true);
                  const result = await activateCode(code.trim());
                  setActivating(false);
                  if (result.success) {
                    toast.success(t('activate.success'));
                    setCode('');
                  } else {
                    toast.error(result.error || t('activate.failed'));
                  }
                }}
                className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Key className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Buy section - only for non-premium users */}
        {!isPremium && (
          <>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground font-medium">{t('premium.orBuy')}</span>
              <Separator className="flex-1" />
            </div>

            {/* Tier selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['1m', '3m', '12m'] as PriceTier[]).map((tier) => {
                const price = prices[tier];
                const label = t(`premium.tier_${tier}`);
                const isSelected = selectedTier === tier;
                let savingsPercent = 0;
                const monthlyPrice = parseFloat(prices['1m']);
                const tierPrice = parseFloat(price);
                if (monthlyPrice > 0 && tierPrice > 0) {
                  const months = tier === '3m' ? 3 : tier === '12m' ? 12 : 1;
                  const fullPrice = monthlyPrice * months;
                  savingsPercent = Math.round(((fullPrice - tierPrice) / fullPrice) * 100);
                }
                return (
                  <button
                    key={tier}
                    onClick={() => { setSelectedTier(tier); setShowPaypal(false); }}
                    className={`relative rounded-lg border p-2 text-center transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-600 shadow-sm'
                        : 'border-border hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    {savingsPercent > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        -{savingsPercent}%
                      </span>
                    )}
                    <div className="text-xs font-medium text-foreground">{label}</div>
                    {price && <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{price}€</div>}
                  </button>
                );
              })}
            </div>

            {/* Premium features list */}
            <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
              {[
                { icon: BarChart3, key: 'premium.featureLimits' },
                { icon: TrendingUp, key: 'premium.featureCharts' },
                { icon: PiggyBank, key: 'premium.featureSavings' },
                { icon: ArrowLeftRight, key: 'premium.featureTransfers' },
              ].map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>

            {!showPaypal ? (
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/50"
                onClick={() => setShowPaypal(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                {t('premium.buyLicense')} — {prices[selectedTier]}€
              </Button>
            ) : (
              <div className="space-y-2">
                <div id="paypal-button-container-banner" className="min-h-[45px]">
                  {!paypalReady && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {paypalLoading && (
                  <p className="text-center text-xs text-muted-foreground animate-pulse">
                    {t('premium.processing')}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
