import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY_DEVICE_ID = 'budget-card-device-id';

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, deviceId);
  }
  return deviceId;
};

export const usePremiumStatus = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deviceId = getDeviceId();

  const checkStatus = useCallback(async () => {
    if (authLoading) return;

    // If user is logged in, use the combined check-status endpoint
    if (session?.access_token) {
      try {
        const { data, error } = await supabase.functions.invoke('check-status', {
          body: { deviceId },
        });

        if (!error && data) {
          setIsPremium(data.isPremium || false);
          setValidUntil(data.validUntil ? new Date(data.validUntil) : null);
          setSource(data.source || null);
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
    } else {
      // Not logged in - not premium (need to login first)
      setIsPremium(false);
    }
    setIsLoading(false);
  }, [session?.access_token, deviceId, authLoading]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Listen for premium status changes
  useEffect(() => {
    const handler = () => checkStatus();
    window.addEventListener('premium-status-changed', handler);
    window.addEventListener('ad-free-purchased', handler);
    return () => {
      window.removeEventListener('premium-status-changed', handler);
      window.removeEventListener('ad-free-purchased', handler);
    };
  }, [checkStatus]);

  const daysRemaining = validUntil
    ? Math.max(0, Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    isPremium,
    isLoading: isLoading || authLoading,
    validUntil,
    daysRemaining,
    source,
    deviceId,
    checkStatus,
  };
};
