import { useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';

export const AdMobBanner = () => {
  const { isInitialized, showBanner, removeBanner } = useAdMob();
  const { isAdFree, isLoading } = useAdFreePurchase();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAdFree) {
      // User has purchased ad-free, remove any existing banner
      removeBanner();
      return;
    }

    if (isInitialized) {
      showBanner();
    }
  }, [isInitialized, isAdFree, isLoading, showBanner, removeBanner]);

  // This component doesn't render anything visible
  // The banner is shown natively by the AdMob SDK
  return null;
};
