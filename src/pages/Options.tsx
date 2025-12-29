import { Languages, Check } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';

const Options = () => {
  const { language, setLanguage, t, languageNames } = useLanguage();

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('options.title')}</h1>
        
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('options.language')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "outline"}
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
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Options;