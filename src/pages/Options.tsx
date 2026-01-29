import { useState } from 'react';
import { Languages, Check, Sun, Moon, Palette, Target, Share2, RotateCcw, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency, currencies, Currency } from '@/contexts/CurrencyContext';
import { Language } from '@/i18n/translations';
import { BudgetLimitsForm } from '@/components/BudgetLimitsForm';
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
        
        
        <div className="space-y-4">
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

          {/* Language Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('options.language')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => handleLanguageSelect(lang)}
                >
                  <span className="text-lg">{languageNames[lang].flag}</span>
                  <span>{languageNames[lang].name}</span>
                  {language === lang && <Check className="w-4 h-4 ml-auto" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Currency Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('options.currency')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((curr) => (
                <Button
                  key={curr.code}
                  variant={currency === curr.code ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => setCurrency(curr.code)}
                >
                  <span className="text-lg font-medium">{curr.symbol}</span>
                  <span>{curr.code}</span>
                  {currency === curr.code && <Check className="w-4 h-4 ml-auto" />}
                </Button>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('limits.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t('limits.description')}
            </p>
            <BudgetLimitsForm />
          </div>

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
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Options;
