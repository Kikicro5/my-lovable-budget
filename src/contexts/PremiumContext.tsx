import React, { createContext, useContext, useCallback } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  expiresAt: Date | null;
  daysRemaining: number | null;
  checkStatus: () => Promise<void>;
  activateCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Device ID is now provided by billing service

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkStatus = useCallback(async () => {
    // Aplikacija je besplatna za sve — status se više ne provjerava naplatom.
  }, []);

  const activateCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    return { success: true };
  };

  return (
    <PremiumContext.Provider value={{ isPremium: true, isLoading: false, expiresAt: null, daysRemaining: null, checkStatus, activateCode }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) throw new Error('usePremium must be used within PremiumProvider');
  return context;
};
