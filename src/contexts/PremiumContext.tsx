import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  expiresAt: Date | null;
  daysRemaining: number | null;
  checkStatus: () => Promise<void>;
  activateCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const DEVICE_ID_KEY = 'budget-card-device-id';

const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isAdmin } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    if (isAdmin) {
      setIsPremium(true);
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    if (!session) {
      setIsPremium(false);
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-status', {
        body: { deviceId: getDeviceId() },
      });

      if (!error && data?.isPremium) {
        setIsPremium(true);
        setExpiresAt(data.expiresAt ? new Date(data.expiresAt) : null);
      } else {
        setIsPremium(false);
        setExpiresAt(null);
      }
    } catch {
      setIsPremium(false);
      setExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, isAdmin]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const activateCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!session) return { success: false, error: 'Morate biti prijavljeni' };

    try {
      const { data, error } = await supabase.functions.invoke('activate-code', {
        body: { code, deviceId: getDeviceId() },
      });

      if (error) {
        return { success: false, error: 'Greška pri aktivaciji' };
      }

      if (data?.success) {
        await checkStatus();
        return { success: true };
      }

      return { success: false, error: data?.error || 'Nepoznata greška' };
    } catch {
      return { success: false, error: 'Greška pri povezivanju' };
    }
  };

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, expiresAt, daysRemaining, checkStatus, activateCode }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) throw new Error('usePremium must be used within PremiumProvider');
  return context;
};
