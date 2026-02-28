import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import { Key, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

export function GlobalActivateCodeDialog() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { activateCode, isPremium, activateDialogOpen, closeActivateDialog } = usePremiumContext();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (isPremium) return null;

  const handleActivate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const result = await activateCode(code.trim());
    setLoading(false);

    if (result.success) {
      toast.success(t('activate.success'));
      closeActivateDialog();
      setCode('');
    } else {
      toast.error(result.error || t('activate.failed'));
    }
  };

  return (
    <Dialog open={activateDialogOpen} onOpenChange={(open) => { if (!open) closeActivateDialog(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('activate.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="XXXX-XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono text-center text-lg tracking-wider"
          />
          <Button onClick={handleActivate} disabled={loading || !code.trim()} className="w-full">
            {loading ? '...' : t('activate.button')}
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium">{t('premium.orBuy')}</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/50"
            onClick={() => {
              closeActivateDialog();
              navigate('/options');
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            {t('premium.buyLicense')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
