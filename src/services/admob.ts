import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { isNative } from '@/utils/platform';

const BANNER_AD_ID = 'ca-app-pub-0825549313210028/2423468724';
const ADS_DISABLED = false;

let initialized = false;
let bannerVisible = false;

export const initializeAdMob = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative() || initialized) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
  } catch (err) {
    console.warn('[AdMob] init failed', err);
  }
};

export const showBannerAd = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative()) return;
  if (!initialized) await initializeAdMob();
  if (bannerVisible) return;
  try {
    const options: BannerAdOptions = {
      adId: BANNER_AD_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 56,
      isTesting: false,
    };
    await AdMob.showBanner(options);
    bannerVisible = true;
  } catch (err) {
    console.warn('[AdMob] showBanner failed', err);
  }
};

export const hideBannerAd = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative() || !bannerVisible) return;
  try {
    await AdMob.hideBanner();
    bannerVisible = false;
  } catch (err) {
    console.warn('[AdMob] hideBanner failed', err);
  }
};

export const removeBannerAd = async (): Promise<void> => {
  if (ADS_DISABLED || !isNative()) return;
  try {
    await AdMob.removeBanner();
    bannerVisible = false;
  } catch (err) {
    console.warn('[AdMob] removeBanner failed', err);
  }
};