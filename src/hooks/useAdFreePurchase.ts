import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve a persistent device ID
const getDeviceId = (): string => {
  const storageKey = 'budget-card-device-id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
};

export const useAdFreePurchase = () => {
  const [isAdFree, setIsAdFree] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const deviceId = getDeviceId();

  const checkPurchaseStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ad_free_purchases')
        .select('id')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (error) {
        console.error('Error checking purchase status:', error);
        setIsAdFree(false);
      } else {
        setIsAdFree(!!data);
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
      setIsAdFree(false);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  const verifyAndSavePurchase = async (orderId: string): Promise<boolean> => {
    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
        body: { orderId, deviceId },
      });

      if (error) {
        console.error('Verification error:', error);
        return false;
      }

      if (data?.success) {
        setIsAdFree(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error verifying purchase:', err);
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  return {
    isAdFree,
    isLoading,
    isPurchasing,
    deviceId,
    checkPurchaseStatus,
    verifyAndSavePurchase,
  };
};
