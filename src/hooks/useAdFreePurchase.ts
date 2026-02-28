import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY_DEVICE_ID = 'budget-card-device-id';
const STORAGE_KEY_DEVICE_TOKEN = 'budget-card-device-token';

// Generate or retrieve a persistent device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, deviceId);
  }
  
  return deviceId;
};

// Get or generate a signed device token
const getDeviceToken = async (): Promise<string | null> => {
  // Check if we have a cached token
  const cachedToken = localStorage.getItem(STORAGE_KEY_DEVICE_TOKEN);
  if (cachedToken) {
    // Validate token format: deviceId.signature
    const parts = cachedToken.split('.');
    if (parts.length === 2) {
      const tokenDeviceId = parts[0];
      const storedDeviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
      // Make sure token matches current device ID
      if (tokenDeviceId === storedDeviceId) {
        return cachedToken;
      }
    }
    // Token is invalid or doesn't match, clear it
    localStorage.removeItem(STORAGE_KEY_DEVICE_TOKEN);
  }

  // Generate new signed token from server
  const deviceId = getDeviceId();
  try {
    const { data, error } = await supabase.functions.invoke('generate-device-token', {
      body: { deviceId },
    });

    if (error) {
      console.error('Error generating device token:', error);
      return null;
    }

    if (data?.token) {
      localStorage.setItem(STORAGE_KEY_DEVICE_TOKEN, data.token);
      return data.token;
    }

    return null;
  } catch (err) {
    console.error('Error generating device token:', err);
    return null;
  }
};

interface PurchaseData {
  id: string;
  expires_at: string;
  purchased_at: string;
  amount?: number;
  currency?: string;
  paypal_order_id?: string;
}

export const useAdFreePurchase = () => {
  const [isAdFree, setIsAdFree] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const deviceId = getDeviceId();

  const checkPurchaseStatus = useCallback(async () => {
    try {
      // Get signed device token
      const deviceToken = await getDeviceToken();
      
      if (!deviceToken) {
        console.error('Could not get device token');
        setIsAdFree(false);
        setExpiresAt(null);
        setIsLoading(false);
        return;
      }

      // Use secure edge function to verify purchase
      const { data, error } = await supabase.functions.invoke('verify-device-purchase', {
        body: { deviceToken },
      });

      if (error) {
        console.error('Error checking purchase status:', error);
        setIsAdFree(false);
        setExpiresAt(null);
        setPurchases([]);
      } else if (data?.isAdFree && data?.purchase) {
        const purchaseData = data.purchase as PurchaseData;
        const expDate = new Date(purchaseData.expires_at);
        setIsAdFree(true);
        setExpiresAt(expDate);
        setPurchases(data.purchases || []);
      } else {
        setIsAdFree(false);
        setExpiresAt(null);
        setPurchases(data?.purchases || []);
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
      setIsAdFree(false);
      setExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  const verifyAndSavePurchase = async (orderId: string): Promise<boolean> => {
    setIsPurchasing(true);
    try {
      // Get signed device token
      const deviceToken = await getDeviceToken();
      
      if (!deviceToken) {
        console.error('Could not get device token for purchase verification');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
        body: { orderId, deviceToken },
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
    purchases,
    checkPurchaseStatus,
    verifyAndSavePurchase,
  };
};
