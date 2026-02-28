import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { setPremiumToastHelpers } from '@/utils/premiumToast';
import { LoginRequiredDialog } from '@/components/LoginRequiredDialog';

export function PremiumToastBridge() {
  const { user } = useAuth();
  const { openActivateDialog } = usePremiumContext();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const showLoginDialog = useCallback(() => setLoginDialogOpen(true), []);

  useEffect(() => {
    setPremiumToastHelpers(!!user, openActivateDialog, showLoginDialog);
  }, [user, openActivateDialog, showLoginDialog]);

  return <LoginRequiredDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />;
}
