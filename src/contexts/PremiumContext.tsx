import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY_DEVICE_ID = 'budget-card-device-id';

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, deviceId);
  }
  return deviceId;
};

interface PremiumContextType {
  isPremium: boolean;
  isAdmin: boolean;
  validUntil: string | null;
  daysRemaining: number | null;
  loading: boolean;
  deviceId: string;
  activateCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  recheckStatus: () => Promise<void>;
  activateDialogOpen: boolean;
  openActivateDialog: () => void;
  closeActivateDialog: () => void;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user, session, isAdmin, loading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const deviceId = getDeviceId();

  const openActivateDialog = useCallback(() => setActivateDialogOpen(true), []);
  const closeActivateDialog = useCallback(() => setActivateDialogOpen(false), []);

  const checkStatus = useCallback(async () => {
    if (authLoading) return;
    if (!session?.access_token || !user) {
      setIsPremium(false);
      setValidUntil(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-status', {
        body: { deviceId },
      });

      if (!error && data) {
        setIsPremium(data.isPremium || false);
        setValidUntil(data.validUntil || null);
      } else {
        setIsPremium(false);
      }
    } catch {
      setIsPremium(false);
    }
    setLoading(false);
  }, [session?.access_token, user, deviceId, authLoading]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Listen for external events
  useEffect(() => {
    const handler = () => checkStatus();
    window.addEventListener('premium-status-changed', handler);
    window.addEventListener('subscription-changed', handler);
    return () => {
      window.removeEventListener('premium-status-changed', handler);
      window.removeEventListener('subscription-changed', handler);
    };
  }, [checkStatus]);

  const activateCode = useCallback(async (code: string) => {
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('activate-code', {
        body: { code, deviceId },
      });

      if (error) return { success: false, error: error.message || 'Activation failed' };
      if (data?.error) return { success: false, error: data.error };

      await checkStatus();
      window.dispatchEvent(new CustomEvent('subscription-changed', { detail: { isPremium: true } }));
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }, [session?.access_token, deviceId, checkStatus]);

  const daysRemaining = validUntil
    ? Math.max(0, Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <PremiumContext.Provider value={{
      isPremium,
      isAdmin,
      validUntil,
      daysRemaining,
      loading: loading || authLoading,
      deviceId,
      activateCode,
      recheckStatus: checkStatus,
      activateDialogOpen,
      openActivateDialog,
      closeActivateDialog,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremiumContext(): PremiumContextType {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error('usePremiumContext must be used within PremiumProvider');
  }
  return ctx;
}
