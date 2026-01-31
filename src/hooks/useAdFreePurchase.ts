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
      // Use fetch with custom header for RLS policy
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/ad_free_purchases?device_id=eq.${encodeURIComponent(deviceId)}&select=id,expires_at,purchased_at`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'x-device-id': deviceId,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();
      const data = results.length > 0 ? results[0] : null;
      const error = null;

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
