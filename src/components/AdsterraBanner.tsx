import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';

interface AdsterraBannerProps {
  // Banner ad key from Adsterra (not pop-under)
  bannerAdKey?: string;
  width?: number;
  height?: number;
}

export const AdsterraBanner = ({ 
  bannerAdKey,
  width = 320,
  height = 50 
}: AdsterraBannerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAdFree, isLoading } = useAdFreePurchase();

  useEffect(() => {
    // Only show on web, not on native platforms
    if (Capacitor.isNativePlatform()) {
      return;
    }

    // Don't show if user has ad-free or still loading
    if (isLoading || isAdFree) {
      return;
    }

    // Only render if we have a banner ad key
    if (!bannerAdKey) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create atOptions for Adsterra banner
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : '${bannerAdKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;
    container.appendChild(optionsScript);

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${bannerAdKey}/invoke.js`;
    invokeScript.async = true;
    container.appendChild(invokeScript);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [bannerAdKey, width, height, isAdFree, isLoading]);

  // Don't render anything on native platforms
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  // Don't render if ad-free
  if (isLoading || isAdFree) {
    return null;
  }

  // Don't render if no banner key configured
  if (!bannerAdKey) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center items-center bg-muted/30 rounded-lg py-2 overflow-hidden"
      style={{ minHeight: height + 16 }}
    />
  );
};
