import { useCallback, useRef } from 'react';
import { useAdMob } from './useAdMob';
import { useAdFreePurchase } from './useAdFreePurchase';

// Show interstitial every N actions (e.g., every 5th transaction)
const ACTIONS_BETWEEN_ADS = 5;
const ACTION_COUNT_KEY = 'admob-action-count';

export const useInterstitialAd = () => {
  const { showInterstitial, isInterstitialLoaded, canShowInterstitial } = useAdMob();
  const { isAdFree, isLoading } = useAdFreePurchase();
  const isShowingRef = useRef(false);

  // Get current action count
  const getActionCount = useCallback(() => {
    const count = localStorage.getItem(ACTION_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  }, []);

  // Increment action count
  const incrementActionCount = useCallback(() => {
    const currentCount = getActionCount();
    const newCount = currentCount + 1;
    localStorage.setItem(ACTION_COUNT_KEY, newCount.toString());
    return newCount;
  }, [getActionCount]);

  // Reset action count
  const resetActionCount = useCallback(() => {
    localStorage.setItem(ACTION_COUNT_KEY, '0');
  }, []);

  /**
   * Call this after an action (e.g., adding a transaction).
   * It will show an interstitial ad if:
   * - User hasn't purchased ad-free
   * - Enough actions have occurred since last ad
   * - Cooldown period has passed
   * - Ad is loaded and ready
   */
  const triggerAfterAction = useCallback(async (): Promise<boolean> => {
    // Skip if ad-free is purchased or still loading
    if (isLoading || isAdFree) {
      return false;
    }

    // Prevent multiple simultaneous triggers
    if (isShowingRef.current) {
      return false;
    }

    const newCount = incrementActionCount();
    
    // Only show ad every N actions
    if (newCount < ACTIONS_BETWEEN_ADS) {
      console.log(`Interstitial: ${newCount}/${ACTIONS_BETWEEN_ADS} actions until next ad`);
      return false;
    }

    // Check if we can show (cooldown, loaded, etc.)
    if (!isInterstitialLoaded || !canShowInterstitial()) {
      console.log('Interstitial: Not ready or in cooldown');
      return false;
    }

    isShowingRef.current = true;
    
    try {
      const shown = await showInterstitial();
      if (shown) {
        resetActionCount();
        console.log('Interstitial: Ad shown, action count reset');
        return true;
      }
    } catch (error) {
      console.error('Interstitial: Error showing ad', error);
    } finally {
      isShowingRef.current = false;
    }

    return false;
  }, [isLoading, isAdFree, isInterstitialLoaded, canShowInterstitial, showInterstitial, incrementActionCount, resetActionCount]);

  return {
    triggerAfterAction,
    isAdFree,
    actionsUntilAd: ACTIONS_BETWEEN_ADS - getActionCount(),
  };
};
