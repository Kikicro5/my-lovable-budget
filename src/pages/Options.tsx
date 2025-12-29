import { Languages, Check } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const languages = [
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const Options = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('hr');

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    const currentUrl = window.location.origin;
    if (code === 'hr') {
      // If Croatian, just stay on original site
      window.location.href = currentUrl;
    } else {
      const translateUrl = `https://translate.google.com/translate?sl=hr&tl=${code}&u=${encodeURIComponent(currentUrl)}`;
      window.location.href = translateUrl;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">Opcije</h1>
        
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Jezik</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {selectedLanguage === lang.code && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
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
