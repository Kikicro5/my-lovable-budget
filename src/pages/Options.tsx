import { useState, useEffect, useRef } from 'react';
import { Languages, Sun, Moon, Palette, Share2, RotateCcw, Coins, Check, FileText, Crown, Key, LogOut, LogIn, Shield, Cloud, CloudOff, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
  const { user, isAdmin, signOut } = useAuth();
  const { isPremium, daysRemaining, activateCode } = usePremium();
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const premiumRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      toast.success(t('premium.codeActivatedToast'));
    } else {
      toast.error(result.error || t('premium.activationError'));
    }
    setActivating(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'BudgetCard',
      text: t('share.message') || 'Check out this budget tracking app!',
      url: 'https://play.google.com/store/apps/details?id=app.lovable.budgetcard.twa',
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
      await navigator.clipboard.writeText('https://play.google.com/store/apps/details?id=app.lovable.budgetcard.twa');
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
            
            {/* Premium Benefits - only show when not premium */}
            {!isPremium && (
              <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium text-foreground mb-2">{t('premium.benefits.title')}</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{t('premium.benefits.limits')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{t('premium.benefits.charts')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{t('premium.benefits.investments')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{t('premium.benefits.savings')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{t('premium.benefits.transfers')}</span>
                  </li>
                </ul>
              </div>
            )}
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

                {/* PayPal Purchase */}
                <div className="border-t border-border pt-3 mt-3">
                  <PayPalPurchase />
                </div>
              </div>
            )}
          </div>

          {/* Account Section - Login/Logout */}
          <div className="bg-card rounded-xl p-4 border border-border">
            {user ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => signOut()} 
                  className="w-full gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('auth.logout')}
                </Button>

                {/* Admin Panel Button */}
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin')} 
                    className="w-full gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full gap-2">
                <LogIn className="w-4 h-4" />
                {t('auth.login')}
              </Button>
            )}
          </div>

          {/* Guide & Share Row */}
          <div className="grid grid-cols-2 gap-4">
            <AppGuide />
            <Button onClick={handleShare} variant="outline" className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              Share App
            </Button>
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
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Options;
