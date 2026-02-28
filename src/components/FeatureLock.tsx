import { Lock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useLanguage } from '@/i18n/LanguageContext';

interface FeatureLockProps {
  children: React.ReactNode;
  featureName?: string;
}

export const FeatureLock = ({ children, featureName }: FeatureLockProps) => {
  const { isPremium, isLoading } = usePremiumStatus();
  const { t } = useLanguage();

  if (isLoading) {
    return <>{children}</>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50 saturate-0">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl bg-background/60 backdrop-blur-[2px] border border-primary/20">
        <div className="flex flex-col items-center gap-3 p-4 text-center max-w-[240px]">
          <div className="p-3 rounded-full bg-primary/10">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {featureName || t('feature.locked.title')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('feature.locked.description')}
            </p>
          </div>
          <Button asChild size="sm" className="gap-2 bg-primary text-primary-foreground">
            <Link to="/options">
              <Star className="w-3.5 h-3.5" />
              {t('feature.locked.unlock')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
