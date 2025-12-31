import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, languageNames } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app-language';
const SUPPORTED_LANGUAGES: Language[] = ['hr', 'en', 'de', 'pl', 'es', 'fr'];

const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  return 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
      return saved as Language;
    }
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};