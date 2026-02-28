import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, DollarSign } from 'lucide-react';

interface PriceTier {
  id: string;
  price: number;
  duration_days: number;
  currency: string;
}

const TIER_LABELS: Record<string, string> = {
  '1month': 'admin.1month',
  '3months': 'admin.3months',
  '12months': 'admin.12months',
};

const AdminPricing = () => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<PriceTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', { method: 'GET' });
      if (error) throw error;
      setPrices(data?.prices || []);
    } catch {
      toast.error(t('admin.failedLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const updatePrice = (id: string, field: 'price' | 'duration_days', value: string) => {
    setPrices(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: field === 'price' ? parseFloat(value) || 0 : parseInt(value) || 0 } : p
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { action: 'update-prices', prices },
      });
      if (error) throw error;
      toast.success(t('admin.pricesSaved'));
    } catch {
      toast.error(t('admin.failedSavePrices'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          {t('admin.pricing')}
        </h2>

        <div className="space-y-4">
          {prices.map(tier => (
            <div key={tier.id} className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-foreground">
                {TIER_LABELS[tier.id] ? t(TIER_LABELS[tier.id]) : tier.id}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('admin.priceLabel')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tier.price}
                    onChange={e => updatePrice(tier.id, 'price', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('admin.durationDays')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={tier.duration_days}
                    onChange={e => updatePrice(tier.id, 'duration_days', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full gap-2 mt-4" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('admin.savePrices')}
        </Button>
      </div>
    </div>
  );
};

export default AdminPricing;
