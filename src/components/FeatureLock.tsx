import { Lock } from 'lucide-react';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { showPremiumToast } from '@/utils/premiumToast';
import { cn } from '@/lib/utils';

interface FeatureLockProps {
  children: React.ReactNode;
  featureName?: string;
}

export const FeatureLock = ({ children, featureName }: FeatureLockProps) => {
  const { isPremium, loading } = usePremiumContext();

  if (loading || isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-xl overflow-hidden" onClick={() => showPremiumToast()}>
      <div className="pointer-events-none select-none opacity-60 grayscale-[30%]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 bg-background/90 dark:bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-300/50 dark:border-amber-600/40 shadow-md">
          <Lock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Premium</span>
        </div>
      </div>
    </div>
  );
};
