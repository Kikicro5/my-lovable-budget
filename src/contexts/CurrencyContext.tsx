import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'EUR' | 'USD' | 'CNY' | 'CAD' | 'GBP' | 'PLN' | 'CZK' | 'HUF' | 'SEK' | 'INR';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

export const currencies: CurrencyInfo[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  currencySymbol: string;
  currencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'app-currency';

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Currency) || 'EUR';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('hr-HR', {
      style: 'currency',
      currency: currency,
    });
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatAmount, 
      currencySymbol: currencyInfo.symbol,
      currencyInfo 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
