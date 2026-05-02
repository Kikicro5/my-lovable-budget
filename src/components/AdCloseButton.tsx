import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { subscribeBannerVisibility, closeBannerAd } from '@/services/admob';
import { isNative } from '@/utils/platform';

export const AdCloseButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isNative()) return;
    const unsub = subscribeBannerVisibility(setVisible);
    return unsub;
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => closeBannerAd()}
      aria-label="Zatvori oglas"
      className="fixed right-2 z-[60] flex items-center justify-center w-7 h-7 rounded-full bg-background/90 border border-border shadow-md text-foreground active:scale-95 transition-transform"
      style={{ top: 'calc(env(safe-area-inset-top) + 50px + 4px)' }}
    >
      <X className="w-4 h-4" />
    </button>
  );
};
