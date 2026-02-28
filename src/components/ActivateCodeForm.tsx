import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Key, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Link } from 'react-router-dom';

const STORAGE_KEY_DEVICE_ID = 'budget-card-device-id';

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, deviceId);
  }
  return deviceId;
};

export const ActivateCodeForm = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  if (!user) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {t('activate.title') || 'Activate Premium'}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {t('activate.loginRequired') || 'Please sign in to activate a premium code.'}
        </p>
        <Button asChild className="w-full">
          <Link to="/auth">{t('auth.login') || 'Login'}</Link>
        </Button>
      </div>
    );
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke('activate-code', {
        body: { code: code.trim().toUpperCase(), deviceId: getDeviceId() },
      });

      if (error) {
        toast.error(data?.error || 'Activation failed');
      } else if (data?.success) {
        setActivated(true);
        toast.success(t('activate.success') || 'Premium activated!');
        window.dispatchEvent(new Event('premium-status-changed'));
      } else {
        toast.error(data?.error || 'Activation failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsActivating(false);
    }
  };

  if (activated) {
    return (
      <div className="bg-card rounded-xl p-4 border border-primary/30">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{t('activate.activated') || 'Premium Activated!'}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('activate.activatedDesc') || 'All premium features are now unlocked.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {t('activate.title') || 'Activate Premium'}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {t('activate.description') || 'Enter your activation code to unlock premium features.'}
      </p>
      <form onSubmit={handleActivate} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="activation-code" className="text-xs">{t('activate.code') || 'Activation Code'}</Label>
          <Input
            id="activation-code"
            placeholder="XXXX-XXXX-XXXX"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={50}
            className="font-mono tracking-wider"
            required
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={isActivating}>
          {isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          {t('activate.button') || 'Activate'}
        </Button>
      </form>
    </div>
  );
};
