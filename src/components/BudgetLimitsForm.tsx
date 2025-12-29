import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, TrendingDown, LineChart, PiggyBank } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useBudget } from '@/hooks/useBudget';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const BudgetLimitsForm = () => {
  const { t } = useLanguage();
  const { state, setDefaultLimits } = useBudget();
  const [open, setOpen] = useState(false);
  const [expenseLimit, setExpenseLimit] = useState(state.defaultLimits.expense.toString());
  const [investmentLimit, setInvestmentLimit] = useState(state.defaultLimits.investment.toString());
  const [savingsLimit, setSavingsLimit] = useState(state.defaultLimits.savings.toString());

  const handleSave = () => {
    setDefaultLimits({
      expense: parseFloat(expenseLimit) || 0,
      investment: parseFloat(investmentLimit) || 0,
      savings: parseFloat(savingsLimit) || 0,
    });
    toast({
      title: t('limits.title'),
      description: t('limits.save'),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="w-4 h-4" />
          {t('limits.set')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('limits.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-expense" />
              {t('limits.expense')}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00 €"
              value={expenseLimit}
              onChange={(e) => setExpenseLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <LineChart className="w-4 h-4 text-primary" />
              {t('limits.investment')}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00 €"
              value={investmentLimit}
              onChange={(e) => setInvestmentLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-accent" />
              {t('limits.savings')}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00 €"
              value={savingsLimit}
              onChange={(e) => setSavingsLimit(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          {t('limits.save')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};