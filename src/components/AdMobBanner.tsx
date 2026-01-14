import { useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';

export const AdMobBanner = () => {
  const { isInitialized, showBanner } = useAdMob();

  useEffect(() => {
    if (isInitialized) {
      showBanner();
    }
  }, [isInitialized, showBanner]);

  // This component doesn't render anything visible
  // The banner is shown natively by the AdMob SDK
  return null;
};
