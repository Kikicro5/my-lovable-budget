import { Languages, Check, Sun, Moon, Palette, Repeat, Target, Bell } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Language } from '@/i18n/translations';
import { RecurringTransactionsManager } from '@/components/RecurringTransactionsManager';
import { BudgetLimitsForm } from '@/components/BudgetLimitsForm';
import { NotificationSettings } from '@/components/NotificationSettings';

const Options = () => {
  const { language, setLanguage, t, languageNames } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('options.title')}</h1>
        
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

          {/* Budget Limits Section */}
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

          {/* Recurring Transactions Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Repeat className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('recurring.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t('recurring.description')}
            </p>
            <RecurringTransactionsManager />
          </div>

          {/* Notifications Section */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('notifications.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t('notifications.description')}
            </p>
            <NotificationSettings />
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Options;