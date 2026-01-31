import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

// AdMob configuration - Google Mobile Ads SDK
const ADMOB_CONFIG = {
  // App ID za Google Mobile Ads SDK
  appId: 'ca-app-pub-0825549313210028~8911340745',
  // Banner Ad Unit ID
  bannerAdUnitId: 'ca-app-pub-0825549313210028/1716227063',
  // Native Ad Unit ID (za napredne nativne oglase)
  nativeAdUnitId: 'ca-app-pub-0825549313210028/7497005461',
};

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const initializeAdMob = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Not a native platform, skipping initialization');
        return;
      }

      try {
        const { AdMob } = await import('@capacitor-community/admob');
        
        await AdMob.initialize({
          initializeForTesting: false,
        });
        
        setIsInitialized(true);
        console.log('AdMob initialized successfully');
      } catch (error) {
        console.error('AdMob initialization failed:', error);
      }
    };

    initializeAdMob();
  }, []);

  const showBanner = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
      
      await AdMob.showBanner({
        adId: ADMOB_CONFIG.bannerAdUnitId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      
      setIsBannerVisible(true);
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Failed to show banner:', error);
    }
  };

  const hideBanner = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
      setIsBannerVisible(false);
    } catch (error) {
      console.error('Failed to hide banner:', error);
    }
  };

  const removeBanner = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.removeBanner();
      setIsBannerVisible(false);
    } catch (error) {
      console.error('Failed to remove banner:', error);
    }
  };

  return {
    isInitialized,
    isBannerVisible,
    showBanner,
    hideBanner,
    removeBanner,
  };
};
