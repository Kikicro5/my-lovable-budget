import { useState, useMemo } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BottomNavigation } from '@/components/BottomNavigation';
import { TransactionList } from '@/components/TransactionList';

import { MonthlyBudget } from '@/types/budget';
import { Calendar, ChevronRight, ChevronDown, TrendingUp, TrendingDown, Wallet, Download, Trash2, PieChart } from 'lucide-react';
import { Search } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BreakdownType = 'expense' | 'income' | 'investment' | 'savings';

const breakdownConfig: Record<BreakdownType, { labelKey: string; colorClass: string; sign: string }> = {
  expense: { labelKey: 'balance.expense', colorClass: 'text-expense', sign: '-' },
  income: { labelKey: 'balance.income', colorClass: 'text-income', sign: '+' },
  investment: { labelKey: 'balance.investment', colorClass: 'text-primary', sign: '' },
  savings: { labelKey: 'balance.savings', colorClass: 'text-accent', sign: '' },
};

const CategoryBreakdown = ({ budget, onRemove }: { budget: MonthlyBudget; onRemove: (id: string) => void }) => {
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const [activeType, setActiveType] = useState<BreakdownType>('expense');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, { total: number; items: typeof budget.transactions }>();
    budget.transactions
      .filter((tx) => tx.type === activeType && !tx.isWithdrawal)
      .forEach((tx) => {
        const key = tx.category || '—';
        const entry = map.get(key) || { total: 0, items: [] };
        entry.total += tx.amount;
        entry.items.push(tx);
        map.set(key, entry);
      });
    return Array.from(map.entries())
      .map(([category, val]) => ({ category, total: val.total, items: val.items }))
      .sort((a, b) => b.total - a.total);
  }, [budget.transactions, activeType]);

  const grandTotal = grouped.reduce((s, g) => s + g.total, 0);
  const cfg = breakdownConfig[activeType];

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <PieChart className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-foreground">
          {t('archive.byCategory') !== 'archive.byCategory' ? t('archive.byCategory') : 'Po kategorijama'}
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-4 bg-muted/40 p-1 rounded-lg">
        {(Object.keys(breakdownConfig) as BreakdownType[]).map((type) => (
          <button
            key={type}
            onClick={() => { setActiveType(type); setExpandedCat(null); }}
            className={cn(
              'text-xs font-medium py-2 px-1 rounded-md transition-colors',
              activeType === type ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(breakdownConfig[type].labelKey)}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          {t('transaction.noTransactions')}
        </p>
      ) : (
        <div className="space-y-2">
          {grouped.map(({ category, total, items }) => {
            const isOpen = expandedCat === category;
            const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
            return (
              <div key={category} className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isOpen ? null : category)}
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-foreground truncate">{category}</span>
                      <span className={cn('font-semibold text-sm shrink-0', cfg.colorClass)}>
                        {cfg.sign}{total.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} {currencySymbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', activeType === 'expense' ? 'bg-expense' : activeType === 'income' ? 'bg-income' : activeType === 'investment' ? 'bg-primary' : 'bg-accent')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {pct.toFixed(0)}% · {items.length}
                      </span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-border bg-muted/20 p-2">
                    <TransactionList
                      transactions={items}
                      onRemove={onRemove}
                      filterType={activeType}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Archive = () => {
  const { getPastBudgets, getBalance, getTotalIncome, getTotalExpense, removeTransaction, removeBudget } = useBudget();
  const [selectedBudget, setSelectedBudget] = useState<MonthlyBudget | null>(null);
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const pastBudgets = getPastBudgets();

  // Group budgets by year
  const budgetsByYear = useMemo(() => {
    const grouped: Record<number, MonthlyBudget[]> = {};
    pastBudgets.forEach((budget) => {
      if (!grouped[budget.year]) {
        grouped[budget.year] = [];
      }
      grouped[budget.year].push(budget);
    });
    // Sort months within each year (descending)
    Object.keys(grouped).forEach((year) => {
      grouped[Number(year)].sort((a, b) => b.month - a.month);
    });
    return grouped;
  }, [pastBudgets]);

  // Get sorted years (descending)
  const sortedYears = useMemo(() => {
    return Object.keys(budgetsByYear)
      .map(Number)
      .sort((a, b) => b - a);
  }, [budgetsByYear]);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const getYearTotals = (year: number) => {
    const yearBudgets = budgetsByYear[year] || [];
    let totalIncome = 0;
    let totalExpense = 0;
    yearBudgets.forEach((budget) => {
      totalIncome += getTotalIncome(budget);
      totalExpense += getTotalExpense(budget);
    });
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  };

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
          <CategoryBreakdown budget={selectedBudget} onRemove={removeTransaction} />
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
          <div className="space-y-4">
            {sortedYears.map((year) => {
              const { totalIncome, totalExpense, balance } = getYearTotals(year);
              const isExpanded = expandedYears.includes(year);
              const monthCount = budgetsByYear[year].length;

              return (
                <Collapsible key={year} open={isExpanded} onOpenChange={() => toggleYear(year)}>
                  <div className="bg-card rounded-xl shadow-soft overflow-hidden animate-slide-up">
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h2 className="font-display font-bold text-lg text-foreground">{year}</h2>
                            <p className="text-xs text-muted-foreground">
                              {monthCount} {monthCount === 1 ? t('archive.month') : t('archive.months')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-income">+{totalIncome.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span>
                              <span className="text-expense">-{totalExpense.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span>
                              <span className={cn('font-semibold', balance >= 0 ? 'text-income' : 'text-expense')}>
                                {balance.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    
                    {/* Mobile year summary */}
                    <div className="px-4 pb-3 sm:hidden">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-income">+{totalIncome.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span>
                        <span className="text-expense">-{totalExpense.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span>
                        <span className={cn('font-semibold', balance >= 0 ? 'text-income' : 'text-expense')}>
                          {balance.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}
                        </span>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="border-t border-border">
                        {budgetsByYear[year].map((budget) => {
                          const monthBalance = getBalance(budget);
                          const monthIncome = getTotalIncome(budget);
                          const monthExpense = getTotalExpense(budget);
                          const txCount = budget.transactions.length;
                          return (
                            <div key={budget.id} className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <button onClick={() => setSelectedBudget(budget)} className="font-medium text-foreground hover:text-primary transition-colors text-left flex-1">
                                  {t(`month.${budget.month}`)}
                                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                                    ({txCount})
                                  </span>
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
                                <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-income-light"><TrendingUp className="w-3 h-3 text-income" /></div><span className="text-sm text-income font-medium">+{monthIncome.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span></div>
                                <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-expense-light"><TrendingDown className="w-3 h-3 text-expense" /></div><span className="text-sm text-expense font-medium">-{monthExpense.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span></div>
                                <div className="flex items-center gap-2"><div className={cn('p-1.5 rounded-lg', monthBalance >= 0 ? 'bg-income-light' : 'bg-expense-light')}><Wallet className={cn('w-3 h-3', monthBalance >= 0 ? 'text-income' : 'text-expense')} /></div><span className={cn('text-sm font-medium', monthBalance >= 0 ? 'text-income' : 'text-expense')}>{monthBalance.toLocaleString('hr-HR', { minimumFractionDigits: 0 })} {currencySymbol}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
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