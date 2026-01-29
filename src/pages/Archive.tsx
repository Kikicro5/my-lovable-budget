import { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyBudget } from '@/types/budget';
import { Calendar, ChevronRight, TrendingUp, TrendingDown, Wallet, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MonthCard } from '@/components/MonthCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { exportBudgetToPDF } from '@/utils/exportPdf';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Archive = () => {
  const { getPastBudgets, getBalance, getTotalIncome, getTotalExpense, removeTransaction, removeBudget } = useBudget();
  const [selectedBudget, setSelectedBudget] = useState<MonthlyBudget | null>(null);
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const pastBudgets = getPastBudgets();

  const handleExportPDF = (budget: MonthlyBudget, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      exportBudgetToPDF({
        budget,
        monthName: t(`month.${budget.month}`),
        labels: {
          income: t('balance.income'),
          expense: t('balance.expense'),
          investment: t('balance.investment'),
          savings: t('balance.savings'),
          balance: t('balance.current'),
          transactions: t('pdf.transactions'),
          name: t('pdf.name'),
          category: t('transaction.category'),
          amount: t('transaction.amount'),
          type: t('pdf.type'),
          date: t('pdf.date'),
          summary: t('pdf.summary'),
        },
      });
      toast({
        title: t('pdf.export'),
        description: `${t(`month.${budget.month}`)} ${budget.year}`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće izvesti PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBudget = (budget: MonthlyBudget) => {
    removeBudget(budget.id);
    if (selectedBudget?.id === budget.id) {
      setSelectedBudget(null);
    }
    toast({
      title: t('archive.deleted'),
      description: `${t(`month.${budget.month}`)} ${budget.year}`,
    });
  };

  if (selectedBudget) {
    const balance = getBalance(selectedBudget);
    const income = getTotalIncome(selectedBudget);
    const expense = getTotalExpense(selectedBudget);

    return (
      <div className="min-h-screen bg-background pb-24 pt-4">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSelectedBudget(null)} className="flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity">
              <ChevronRight className="w-4 h-4 rotate-180" />{t('archive.backToArchive')}
            </button>
            <div className="flex items-center gap-2">
              <Button onClick={(e) => handleExportPDF(selectedBudget, e)} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                {t('pdf.export')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('archive.deleteConfirm')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('archive.deleteWarning')} {t(`month.${selectedBudget.month}`)} {selectedBudget.year}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteBudget(selectedBudget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="mb-4"><MonthCard month={selectedBudget.month} year={selectedBudget.year} /></div>
          <div className="bg-card rounded-xl p-5 shadow-soft mb-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-xs text-muted-foreground mb-1">{t('balance.income')}</p><p className="text-lg font-semibold text-income">+{income.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}</p></div>
              <div><p className="text-xs text-muted-foreground mb-1">{t('balance.expense')}</p><p className="text-lg font-semibold text-expense">-{expense.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}</p></div>
              <div><p className="text-xs text-muted-foreground mb-1">{t('balance.current')}</p><p className={cn('text-lg font-semibold', balance >= 0 ? 'text-income' : 'text-expense')}>{balance.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}</p></div>
            </div>
          </div>
          <TransactionList title={t('transaction.allTransactions')} transactions={selectedBudget.transactions} onRemove={removeTransaction} />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-card rounded-2xl p-4 shadow-card animate-slide-up mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary"><Calendar className="w-6 h-6 text-primary-foreground" /></div>
            <div><h1 className="text-xl font-display font-bold text-foreground">{t('archive.title')}</h1><p className="text-muted-foreground text-sm">{t('archive.subtitle')}</p></div>
          </div>
        </div>
        {pastBudgets.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-soft animate-fade-in">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">{t('archive.noArchived')}</h3>
            <p className="text-muted-foreground">{t('archive.willAppear')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastBudgets.map((budget) => {
              const balance = getBalance(budget);
              const income = getTotalIncome(budget);
              const expense = getTotalExpense(budget);
              return (
                <div key={budget.id} className="w-full bg-card rounded-xl p-4 shadow-soft hover:shadow-card transition-all duration-200 animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setSelectedBudget(budget)} className="font-display font-semibold text-foreground hover:text-primary transition-colors text-left flex-1">
                      {t(`month.${budget.month}`)} {budget.year}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button onClick={(e) => handleExportPDF(budget, e)} variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('archive.deleteConfirm')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('archive.deleteWarning')} {t(`month.${budget.month}`)} {budget.year}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBudget(budget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <button onClick={() => setSelectedBudget(budget)}><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-income-light"><TrendingUp className="w-3 h-3 text-income" /></div><span className="text-sm text-income font-medium">+{income.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span></div>
                    <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-expense-light"><TrendingDown className="w-3 h-3 text-expense" /></div><span className="text-sm text-expense font-medium">-{expense.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span></div>
                    <div className="flex items-center gap-2"><div className={cn('p-1.5 rounded-lg', balance >= 0 ? 'bg-income-light' : 'bg-expense-light')}><Wallet className={cn('w-3 h-3', balance >= 0 ? 'text-income' : 'text-expense')} /></div><span className={cn('text-sm font-medium', balance >= 0 ? 'text-income' : 'text-expense')}>{balance.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Archive;