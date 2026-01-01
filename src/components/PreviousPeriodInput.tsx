import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface PreviousPeriodInputProps {
  type: 'investment' | 'savings';
  onSubmit: (amount: number) => void;
}

export const PreviousPeriodInput = ({ type, onSubmit }: PreviousPeriodInputProps) => {
  const [amount, setAmount] = useState('');
  const { t } = useLanguage();

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSubmit(numAmount);
      setAmount('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          {t('monthly.fromPreviousPeriod')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t('transaction.amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <Button onClick={handleSubmit} disabled={!amount || parseFloat(amount) <= 0}>
            {t('monthly.addFromPrevious')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
