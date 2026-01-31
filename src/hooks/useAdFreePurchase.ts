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

interface PurchaseData {
  id: string;
  expires_at: string;
  purchased_at: string;
}

export const useAdFreePurchase = () => {
  const [isAdFree, setIsAdFree] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const deviceId = getDeviceId();

  const checkPurchaseStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ad_free_purchases')
        .select('id, expires_at, purchased_at')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (error) {
        console.error('Error checking purchase status:', error);
        setIsAdFree(false);
        setExpiresAt(null);
      } else if (data) {
        const purchaseData = data as PurchaseData;
        const expDate = new Date(purchaseData.expires_at);
        const now = new Date();
        
        // Check if subscription is still valid
        if (expDate > now) {
          setIsAdFree(true);
          setExpiresAt(expDate);
        } else {
          // Subscription expired
          setIsAdFree(false);
          setExpiresAt(expDate);
        }
      } else {
        setIsAdFree(false);
        setExpiresAt(null);
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
      setIsAdFree(false);
      setExpiresAt(null);
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
        // Set expiration to 1 year from now
        const newExpDate = new Date();
        newExpDate.setFullYear(newExpDate.getFullYear() + 1);
        setExpiresAt(newExpDate);
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

  // Calculate days remaining
  const daysRemaining = expiresAt 
    ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    isAdFree,
    isLoading,
    isPurchasing,
    deviceId,
    expiresAt,
    daysRemaining,
    checkPurchaseStatus,
    verifyAndSavePurchase,
  };
};
