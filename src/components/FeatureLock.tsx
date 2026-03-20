import { Lock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

interface FeatureLockProps {
  children: React.ReactNode;
  featureName?: string;
}

export const FeatureLock = ({ children, featureName }: FeatureLockProps) => {
  const { isPremium, isLoading } = usePremium();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  if (isLoading) return <>{children}</>;
  if (isPremium || isAdmin) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="pointer-events-none select-none blur-sm opacity-50 saturate-0">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-background/60 backdrop-blur-[2px] border border-primary/20">
        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <p className="font-semibold text-sm text-foreground">
              {featureName || t('feature.locked.title')}
            </p>
          </div>
          <Button asChild size="sm" className="gap-2 bg-primary text-primary-foreground shrink-0">
            <Link to="/options#premium">
              <Star className="w-3.5 h-3.5" />
              Aktiviraj premium
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
