import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.budgetcard.twa',
  webDir: 'dist',
  server: {
    url: 'https://2b913f8a-e008-4a13-b688-581953b1b4f7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0D9488",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    },
    AdMob: {
      appId: "ca-app-pub-0825549313210028~8911340745"
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: true,
    scrollEnabled: true
  }
};

export default config;
