import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// AdMob configuration - Google Mobile Ads SDK
const ADMOB_CONFIG = {
  // App ID za Google Mobile Ads SDK
  appId: 'ca-app-pub-0825549313210028~8911340745',
  // Banner Ad Unit ID
  bannerAdUnitId: 'ca-app-pub-0825549313210028/1716227063',
  // Interstitial Ad Unit ID
  interstitialAdUnitId: 'ca-app-pub-0825549313210028/7497005461',
};

// Track interstitial show count for frequency capping
const INTERSTITIAL_COOLDOWN_KEY = 'admob-interstitial-last-shown';
const INTERSTITIAL_MIN_INTERVAL = 60000; // 60 seconds minimum between interstitials

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isInterstitialShowing, setIsInterstitialShowing] = useState(false);

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

  // Check if enough time has passed since last interstitial
  const canShowInterstitial = useCallback(() => {
    const lastShown = localStorage.getItem(INTERSTITIAL_COOLDOWN_KEY);
    if (!lastShown) return true;
    
    const timeSinceLastShown = Date.now() - parseInt(lastShown, 10);
    return timeSinceLastShown >= INTERSTITIAL_MIN_INTERVAL;
  }, []);

  // Prepare (load) interstitial ad
  const prepareInterstitial = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (isInterstitialLoaded) return;

    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
      
      // Add listeners for interstitial events
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('Interstitial ad loaded');
        setIsInterstitialLoaded(true);
      });

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('Interstitial ad dismissed');
        setIsInterstitialShowing(false);
        setIsInterstitialLoaded(false);
        // Pre-load next interstitial
        prepareInterstitial();
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
        console.error('Interstitial failed to load:', error);
        setIsInterstitialLoaded(false);
      });

      AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        console.log('Interstitial ad showed');
        setIsInterstitialShowing(true);
        localStorage.setItem(INTERSTITIAL_COOLDOWN_KEY, Date.now().toString());
      });

      await AdMob.prepareInterstitial({
        adId: ADMOB_CONFIG.interstitialAdUnitId,
      });
      
      console.log('Interstitial ad preparation started');
    } catch (error) {
      console.error('Failed to prepare interstitial:', error);
    }
  }, [isInterstitialLoaded]);

  // Show interstitial ad
  const showInterstitial = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;
    if (!isInterstitialLoaded) {
      console.log('Interstitial not loaded yet');
      return false;
    }
    if (!canShowInterstitial()) {
      console.log('Interstitial cooldown active');
      return false;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.showInterstitial();
      return true;
    } catch (error) {
      console.error('Failed to show interstitial:', error);
      return false;
    }
  }, [isInterstitialLoaded, canShowInterstitial]);

  // Auto-prepare interstitial when initialized
  useEffect(() => {
    if (isInitialized) {
      prepareInterstitial();
    }
  }, [isInitialized, prepareInterstitial]);

  return {
    isInitialized,
    isBannerVisible,
    isInterstitialLoaded,
    isInterstitialShowing,
    showBanner,
    hideBanner,
    removeBanner,
    prepareInterstitial,
    showInterstitial,
    canShowInterstitial,
  };
};
