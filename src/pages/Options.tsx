import { useState, useEffect, useRef } from 'react';
import { Languages, Sun, Moon, Palette, Share2, RotateCcw, Coins, Check, FileText, Crown, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency, currencies, Currency } from '@/contexts/CurrencyContext';
import { Language } from '@/i18n/translations';
import { AppGuide } from '@/components/AppGuide';
import { PayPalPurchase } from '@/components/PayPalPurchase';

import { TermsOfServiceDialog, PrivacyPolicyDialog } from '@/components/LegalDialogs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Options = () => {
  const { language, setLanguage, t, languageNames } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  const { isPremium, daysRemaining, activateCode } = usePremium();
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const premiumRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === '#premium' && premiumRef.current) {
      setTimeout(() => premiumRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, []);

  const handleActivateCode = async () => {
    if (!code.trim()) return;
    setActivating(true);
    const result = await activateCode(code.trim());
    if (result.success) {
      setActivated(true);
      toast.success('Kod uspješno aktiviran!');
    } else {
      toast.error(result.error || 'Greška pri aktivaciji');
    }
    setActivating(false);
  };

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'BudgetCard',
      text: t('share.message') || 'Check out this budget tracking app!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast.success(t('share.copied') || 'Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        
        <div className="space-y-4 mt-4">
          {/* Theme Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('options.theme')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="justify-start gap-2"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" />
                <span>{t('options.theme.light')}</span>
                {theme === 'light' && <Check className="w-4 h-4 ml-auto" />}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="justify-start gap-2"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" />
                <span>{t('options.theme.dark')}</span>
                {theme === 'dark' && <Check className="w-4 h-4 ml-auto" />}
              </Button>
            </div>
          </div>

          {/* Language & Currency Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">{t('options.language')}</h2>
              </div>
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{languageNames[language].flag}</span>
                      <span className="text-sm">{languageNames[language].name}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{languageNames[lang].flag}</span>
                        <span>{languageNames[lang].name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">{t('options.currency')}</h2>
              </div>
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span className="text-lg font-medium">{currencies.find(c => c.code === currency)?.symbol}</span>
                      <span className="text-sm">{t(`currency.${currency}`)}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg font-medium">{curr.symbol}</span>
                        <span>{t(`currency.${curr.code}`)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Premium Section */}
          <div ref={premiumRef} id="premium" className="bg-card rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Premium</h2>
            </div>
            {isPremium ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                <Crown className="w-5 h-5 text-primary" />
                <div>
                   <p className="font-medium text-sm text-foreground">{t('premium.active')}</p>
                  {daysRemaining !== null && (
                    <p className="text-xs text-muted-foreground">{t('premium.daysRemaining').replace('{days}', String(daysRemaining))}</p>
                  )}
                </div>
              </div>
            ) : activated ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                <Check className="w-5 h-5 text-primary" />
                <div>
                   <p className="font-medium text-sm text-foreground">{t('premium.codeSuccess')}</p>
                  <p className="text-xs text-muted-foreground">{t('premium.nowActive')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {user ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t('premium.enterCode')}
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="PREMIUM2024"
                          value={code}
                          onChange={(e) => setCode(e.target.value.toUpperCase())}
                          className="pl-10 font-mono"
                        />
                      </div>
                      <Button onClick={handleActivateCode} disabled={activating || !code.trim()}>
                        {activating ? '...' : t('premium.activate')}
                      </Button>
                    </div>

                    {/* PayPal Purchase - only for logged in users */}
                    <div className="border-t border-border pt-3 mt-3">
                      <PayPalPurchase />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Price preview for non-logged-in users */}
                    <p className="text-sm text-muted-foreground">
                      {t('premium.unlockAll')}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative p-3 rounded-lg border border-border bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">1 mjesec</p>
                        <p className="text-lg font-bold text-foreground mt-1">1.99€</p>
                      </div>
                      <div className="relative p-3 rounded-lg border border-border bg-muted/30 text-center">
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-accent text-accent-foreground">
                          -15%
                        </Badge>
                        <p className="text-xs text-muted-foreground">3 mjeseca</p>
                        <p className="text-lg font-bold text-foreground mt-1">5.99€</p>
                      </div>
                      <div className="relative p-3 rounded-lg border border-primary/30 bg-primary/5 text-center">
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                          -30%
                        </Badge>
                        <p className="text-xs text-muted-foreground">12 mjeseci</p>
                        <p className="text-lg font-bold text-foreground mt-1">16.99€</p>
                        <p className="text-[10px] text-primary mt-0.5">1.42€/mj</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Za kupovinu ili aktivaciju koda potrebna je prijava.
                    </p>
                    <Button onClick={() => window.location.href = '/auth'} className="w-full gap-2">
                      <Crown className="w-4 h-4" />
                      Prijava / Registracija
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* App Guide Section */}
          <AppGuide />

          {/* Share Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Share App</h2>
            </div>
            <Button onClick={handleShare} className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              {t('share.button') || 'Share'}
            </Button>
          </div>

          {/* Reset App Section */}
          <div className="bg-card rounded-xl p-4 border border-destructive/30">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">{t('reset.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t('reset.description')}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {t('reset.button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('reset.confirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('reset.warning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      localStorage.removeItem('monthly-budget-app');
                      toast.success(t('reset.success'));
                      window.location.reload();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {t('reset.button')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Legal Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('legal.title')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TermsOfServiceDialog />
              <PrivacyPolicyDialog />
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Options;
