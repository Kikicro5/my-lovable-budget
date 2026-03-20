import { Capacitor } from '@capacitor/core';

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const isNativeiOS = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
};

export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};
