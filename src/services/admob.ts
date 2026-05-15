import {
  AdMob,
  BannerAdOptions,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';
import { isNative } from '@/utils/platform';

const BANNER_AD_ID = 'ca-app-pub-0825549313210028/3846166268';
const ADS_DISABLED = false;

let initialized = false;
let bannerVisible = false;
let bannerClosed = false;
const listeners = new Set<(visible: boolean) => void>();

// Fallback height used only until the AdMob plugin reports the real size.
const BANNER_HEIGHT_FALLBACK_PX = 60;
let bannerHeightPx = 0;
let sizeListenerAttached = false;

const updateBannerCssVar = () => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(
    '--ad-banner-height',
    bannerVisible ? `${bannerHeightPx || BANNER_HEIGHT_FALLBACK_PX}px` : '0px',
  );
};

const notify = () => {
  listeners.forEach((l) => l(bannerVisible));
  updateBannerCssVar();
};

export const subscribeBannerVisibility = (cb: (visible: boolean) => void): (() => void) => {
  listeners.add(cb);
  cb(bannerVisible);
  return () => {
    listeners.delete(cb);
  };
};

export const isBannerVisible = (): boolean => bannerVisible;

export const initializeAdMob = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative() || initialized) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
    if (!sizeListenerAttached) {
      sizeListenerAttached = true;
      // Real banner dimensions reported by AdMob (adaptive banner height
      // varies by device width and orientation). Update CSS var on change.
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: { width: number; height: number }) => {
        if (info && typeof info.height === 'number' && info.height > 0) {
          bannerHeightPx = info.height;
          updateBannerCssVar();
        }
      });
    }
  } catch (err) {
    console.warn('[AdMob] init failed', err);
  }
};

export const showBannerAd = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative() || bannerClosed) return;
  if (!initialized) await initializeAdMob();
  if (bannerVisible) return;
  try {
    const options: BannerAdOptions = {
      adId: BANNER_AD_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 0,
      isTesting: false,
    };
    await AdMob.showBanner(options);
    bannerVisible = true;
    notify();
  } catch (err) {
    console.warn('[AdMob] showBanner failed', err);
  }
};

export const hideBannerAd = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative() || !bannerVisible) return;
  try {
    await AdMob.hideBanner();
    bannerVisible = false;
    notify();
  } catch (err) {
    console.warn('[AdMob] hideBanner failed', err);
  }
};

export const removeBannerAd = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative()) return;
  try {
    await AdMob.removeBanner();
    bannerVisible = false;
    notify();
  } catch (err) {
    console.warn('[AdMob] removeBanner failed', err);
  }
};

export const closeBannerAd = async (): Promise<void> => {
  bannerClosed = true;
  await removeBannerAd();
};