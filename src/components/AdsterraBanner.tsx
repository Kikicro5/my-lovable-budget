import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdFreePurchase } from '@/hooks/useAdFreePurchase';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdsterraBannerProps {
  bannerAdKey?: string;
  width?: number;
  height?: number;
}

export const AdsterraBanner = ({ 
  bannerAdKey,
  width = 728,
  height = 90 
}: AdsterraBannerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAdFree, isLoading } = useAdFreePurchase();
  const isMobile = useIsMobile();

  // Use mobile-friendly size on small screens
  const effectiveWidth = isMobile ? 320 : width;
  const effectiveHeight = isMobile ? 50 : height;

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (isLoading || isAdFree) return;
    if (!bannerAdKey) return;

    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : '${bannerAdKey}',
        'format' : 'iframe',
        'height' : ${effectiveHeight},
        'width' : ${effectiveWidth},
        'params' : {}
      };
    `;
    container.appendChild(optionsScript);

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
  }, [bannerAdKey, effectiveWidth, effectiveHeight, isAdFree, isLoading]);

  if (Capacitor.isNativePlatform()) return null;
  if (isLoading || isAdFree) return null;
  if (!bannerAdKey) return null;

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center items-center bg-muted/30 rounded-lg py-2 overflow-hidden"
      style={{ minHeight: effectiveHeight + 16 }}
    />
  );
};