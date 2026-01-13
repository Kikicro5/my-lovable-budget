import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRightLeft, LineChart, PiggyBank } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface TransferFromCategoryDialogProps {
  type: 'investment' | 'savings';
  availableAmount: number;
  onTransfer: (amount: number) => void;
}

export const TransferFromCategoryDialog = ({
  type,
  availableAmount,
  onTransfer,
}: TransferFromCategoryDialogProps) => {
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const Icon = type === 'investment' ? LineChart : PiggyBank;
  const label = type === 'investment' ? t('transfer.fromInvestment') : t('transfer.fromSavings');
  const bgClass = type === 'investment' ? 'bg-primary/10' : 'bg-accent/10';
  const iconClass = type === 'investment' ? 'text-primary' : 'text-accent';
  const buttonClass = type === 'investment' 
    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
    : 'bg-accent hover:bg-accent/90 text-accent-foreground';

  const handleTransfer = () => {
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0 || transferAmount > availableAmount) {
      return;
    }
    onTransfer(transferAmount);
    setAmount('');
    setOpen(false);
  };

  const handleMaxClick = () => {
    setAmount(availableAmount.toFixed(2));
  };

  const isValidAmount = () => {
    const transferAmount = parseFloat(amount);
    return !isNaN(transferAmount) && transferAmount > 0 && transferAmount <= availableAmount;
  };

  if (availableAmount <= 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', bgClass)}
        >
          <ArrowRightLeft className={cn('h-4 w-4', iconClass)} />
          {t('transfer.toBalance')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', iconClass)} />
            {label}
          </DialogTitle>
          <DialogDescription>
            {t('transfer.available')}: <span className="font-semibold">{availableAmount.toFixed(2)} €</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              max={availableAmount}
              placeholder={t('transfer.enterAmount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMaxClick}
            >
              Max
            </Button>
          </div>
          {amount && !isValidAmount() && (
            <p className="text-sm text-destructive">
              {parseFloat(amount) > availableAmount 
                ? t('transfer.exceedsAvailable')
                : t('transfer.invalidAmount')}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className={buttonClass}
            onClick={handleTransfer}
            disabled={!isValidAmount()}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {t('transfer.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
