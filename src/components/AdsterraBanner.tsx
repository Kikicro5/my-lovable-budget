import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';

interface AdsterraBannerProps {
  adKey?: string;
}

export const AdsterraBanner = ({ adKey = 'd2c174ed69d310753b252cde1caacb59' }: AdsterraBannerProps) => {
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

    // Create and inject the Adsterra banner script
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://pl28616904.effectivegatecpm.com/${adKey.substring(0,2)}/${adKey.substring(2,4)}/${adKey.substring(4,6)}/${adKey}.js`;
    script.async = true;

    container.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [adKey, isAdFree, isLoading]);

  // Don't render anything on native platforms
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  // Don't render if ad-free
  if (isLoading || isAdFree) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center items-center bg-muted/30 rounded-lg py-2 min-h-[60px]"
    />
  );
};
