import { useState, useEffect, useCallback, useRef } from 'react';
import { BudgetState, MonthlyBudget, Transaction, Category, BudgetLimits, RecurringTransaction, Account, PaymentReminder } from '@/types/budget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'monthly-budget-app';
const SYNC_DEBOUNCE_MS = 2000;

const DEFAULT_LIMITS: BudgetLimits = {
  expense: 0,
  investment: 0,
  savings: 0,
};

const getInitialState = (): BudgetState => {
  const now = new Date();
  return {
    currentMonth: now.getMonth(),
    currentYear: now.getFullYear(),
    budgets: [],
    savedCategories: {
      income: [
        { name: 'Plaća' },
        { name: 'Bonus' },
        { name: 'Freelance' },
        { name: 'Dividende' },
        { name: 'Ostalo' },
      ],
      expense: [
        { name: 'Režije' },
        { name: 'Hrana' },
        { name: 'Transport' },
        { name: 'Zabava' },
        { name: 'Zdravlje' },
        { name: 'Odjeća' },
        { name: 'Ostalo' },
      ],
      investment: [
        { name: 'Dionice' },
        { name: 'Kripto' },
        { name: 'Nekretnine' },
        { name: 'Fondovi' },
        { name: 'Ostalo' },
      ],
      savings: [
        { name: 'Hitni fond' },
        { name: 'Godišnji odmor' },
        { name: 'Mirovina' },
        { name: 'Ostalo' },
      ],
    },
    defaultLimits: DEFAULT_LIMITS,
    recurringTransactions: [],
    accounts: [],
    reminders: [],
  };
};

// Helper to migrate old string categories to new Category format
const migrateCategories = (categories: (string | Category)[]): Category[] => {
  return categories.map((cat) =>
    typeof cat === 'string' ? { name: cat } : cat
  );
};

export const useBudget = () => {
  const { user } = useAuth();
  const canSync = !!user;
  const userId = user?.id;
  const [state, setState] = useState<BudgetState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const defaults = getInitialState();
        // Merge saved categories with defaults and migrate old format
        return {
          ...parsed,
          savedCategories: {
            income: migrateCategories(parsed.savedCategories?.income || defaults.savedCategories.income),
            expense: migrateCategories(parsed.savedCategories?.expense || defaults.savedCategories.expense),
            investment: migrateCategories(parsed.savedCategories?.investment || defaults.savedCategories.investment),
            savings: migrateCategories(parsed.savedCategories?.savings || defaults.savedCategories.savings),
          },
          defaultLimits: parsed.defaultLimits || DEFAULT_LIMITS,
          recurringTransactions: parsed.recurringTransactions || [],
          accounts: parsed.accounts || [],
          reminders: parsed.reminders || [],
        };
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

  // Auto-apply recurring transactions on the 1st of the month
  useEffect(() => {
    const now = new Date();
    const realMonth = now.getMonth();
    const realYear = now.getFullYear();
    const isFirstDayOfMonth = now.getDate() === 1;

    // Check if state month/year is behind real date
    const isNewMonth = 
      realYear > state.currentYear || 
      (realYear === state.currentYear && realMonth > state.currentMonth);

    if (isNewMonth) {
      const newBudgetId = `${realYear}-${realMonth}`;

      setState((prev) => {
        let updatedBudgets = prev.budgets;

        // Apply recurring transactions on the 1st of the month
        const currentBudget = updatedBudgets.find((b) => b.month === realMonth && b.year === realYear);
        const activeRecurring = prev.recurringTransactions.filter((r) => r.isActive);
        
        if (isFirstDayOfMonth && activeRecurring.length > 0 && currentBudget && !currentBudget.recurringApplied) {
          const firstOfMonth = new Date(realYear, realMonth, 1);
          const recurringTransactions: Transaction[] = activeRecurring.map((r) => ({
            id: crypto.randomUUID(),
            name: r.name,
            amount: r.amount,
            type: r.type,
            category: r.category,
            date: firstOfMonth.toISOString(),
            accountId: r.accountId,
          }));

          // Update account balances for recurring transactions
          let updatedAccountsForExisting = prev.accounts || [];
          for (const rt of recurringTransactions) {
            if (rt.accountId) {
              updatedAccountsForExisting = updatedAccountsForExisting.map((acc) => {
                if (acc.id === rt.accountId) {
                  let newBalance = acc.balance;
                  if (rt.type === 'income') {
                    newBalance += rt.amount;
                  } else {
                    newBalance -= rt.amount;
                  }
                  return { ...acc, balance: newBalance };
                }
                return acc;
              });
            }
          }

          updatedBudgets = updatedBudgets.map((b) =>
            b.id === currentBudget.id
              ? { ...b, transactions: [...b.transactions, ...recurringTransactions], recurringApplied: true }
              : b
          );

          return {
            ...prev,
            currentMonth: realMonth,
            currentYear: realYear,
            budgets: updatedBudgets,
            accounts: updatedAccountsForExisting,
          };
        } else if (isFirstDayOfMonth && activeRecurring.length > 0 && !currentBudget) {
          // Create new budget with recurring transactions
          const firstOfMonth = new Date(realYear, realMonth, 1);
          const recurringTransactions: Transaction[] = activeRecurring.map((r) => ({
            id: crypto.randomUUID(),
            name: r.name,
            amount: r.amount,
            type: r.type,
            category: r.category,
            date: firstOfMonth.toISOString(),
            accountId: r.accountId,
          }));

          // Update account balances for recurring transactions
          let updatedAccounts = prev.accounts || [];
          for (const rt of recurringTransactions) {
            if (rt.accountId) {
              updatedAccounts = updatedAccounts.map((acc) => {
                if (acc.id === rt.accountId) {
                  let newBalance = acc.balance;
                  if (rt.type === 'income') {
                    newBalance += rt.amount;
                  } else {
                    newBalance -= rt.amount;
                  }
                  return { ...acc, balance: newBalance };
                }
                return acc;
              });
            }
          }

          const newBudget: MonthlyBudget = {
            id: newBudgetId,
            month: realMonth,
            year: realYear,
            transactions: recurringTransactions,
            savedCategories: { ...prev.savedCategories },
            recurringApplied: true,
          };
          updatedBudgets = [...updatedBudgets, newBudget];

          return {
            ...prev,
            currentMonth: realMonth,
            currentYear: realYear,
            budgets: updatedBudgets,
            accounts: updatedAccounts,
          };
        }

        return {
          ...prev,
          currentMonth: realMonth,
          currentYear: realYear,
          budgets: updatedBudgets,
        };
      });
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Cloud sync: save to database for signed-in users (individual or group)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const cloudLoadedRef = useRef(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const isUpdatingFromRealtimeRef = useRef(false);

  // Check if user is in a group
  useEffect(() => {
    if (!canSync || !userId) {
      setGroupId(null);
      return;
    }

    const checkGroup = async () => {
      try {
        const { data } = await (supabase
          .from('group_members' as any)
          .select('group_id')
          .eq('user_id', userId) as any)
          .maybeSingle();
        setGroupId(data?.group_id || null);
      } catch {
        setGroupId(null);
      }
    };

    checkGroup();
  }, [canSync, userId]);

  const performCloudSave = useCallback(async () => {
    if (!canSync || !userId || isSyncingRef.current || isUpdatingFromRealtimeRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      let error;
      if (groupId) {
        // Save to group_data
        const res = await (supabase
          .from('group_data' as any)
          .update({ data: state as any }) as any)
          .eq('group_id', groupId);
        error = res.error;
      } else {
        // Save to user_data
        const res = await supabase
          .from('user_data')
          .upsert({ user_id: userId, data: state as any }, { onConflict: 'user_id' });
        error = res.error;
      }

      if (error) {
        console.error('Cloud sync error:', error);
        setSyncStatus('error');
      } else {
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.error('Cloud sync error:', err);
      setSyncStatus('offline');
    } finally {
      isSyncingRef.current = false;
    }
  }, [canSync, userId, state, groupId]);

  useEffect(() => {
    if (!canSync || !userId) {
      setSyncStatus(user ? 'offline' : 'idle');
      return;
    }

    if (isUpdatingFromRealtimeRef.current) return;

    // Debounce cloud saves
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      performCloudSave();
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [state, canSync, userId, performCloudSave]);

  // Manual sync function
  const syncNow = useCallback(async () => {
    if (!canSync || !userId) return;
    await performCloudSave();
  }, [canSync, userId, performCloudSave]);

  // Cloud sync: load from database on first mount for signed-in users
  useEffect(() => {
    if (!canSync || !userId || cloudLoadedRef.current) return;
    cloudLoadedRef.current = true;

    const loadCloud = async () => {
      setSyncStatus('syncing');
      try {
        let cloudState: BudgetState | null = null;

        if (groupId) {
          const { data, error } = await (supabase
            .from('group_data' as any)
            .select('data')
            .eq('group_id', groupId) as any)
            .maybeSingle();
          if (!error && data?.data) {
            cloudState = data.data as BudgetState;
          }
        } else {
          const { data, error } = await supabase
            .from('user_data')
            .select('data, updated_at')
            .eq('user_id', userId)
            .maybeSingle();
          if (!error && data?.data) {
            cloudState = data.data as unknown as BudgetState;
          }
        }

        if (cloudState && cloudState.budgets) {
          const cloudTotal = cloudState.budgets.reduce((sum, b) => sum + b.transactions.length, 0);
          const localState = localStorage.getItem(STORAGE_KEY);
          const parsed = localState ? JSON.parse(localState) : null;
          const localTotal = parsed?.budgets?.reduce((sum: number, b: any) => sum + (b.transactions?.length || 0), 0) || 0;

          if (cloudTotal >= localTotal) {
            setState(cloudState);
          }
        }
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Cloud load error:', err);
        setSyncStatus('offline');
      }
    };

    loadCloud();
  }, [canSync, userId, groupId]);

  // Realtime subscription for group_data changes (from other members)
  useEffect(() => {
    if (!groupId || !canSync) return;

    const channel = supabase
      .channel(`group-data-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_data',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newData = (payload.new as any)?.data as BudgetState;
          if (newData && newData.budgets) {
            isUpdatingFromRealtimeRef.current = true;
            setState(newData);
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
            // Reset flag after React processes the update
            setTimeout(() => { isUpdatingFromRealtimeRef.current = false; }, 500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, canSync]);

  const getCurrentBudget = (): MonthlyBudget | undefined => {
    return state.budgets.find(
      (b) => b.month === state.currentMonth && b.year === state.currentYear
    );
  };

  const getOrCreateCurrentBudget = (): MonthlyBudget => {
    const existing = getCurrentBudget();
    if (existing) return existing;

    const newBudget: MonthlyBudget = {
      id: `${state.currentYear}-${state.currentMonth}`,
      month: state.currentMonth,
      year: state.currentYear,
      transactions: [],
      savedCategories: { ...state.savedCategories },
    };

    setState((prev) => ({
      ...prev,
      budgets: [...prev.budgets, newBudget],
    }));

    return newBudget;
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    const budget = getOrCreateCurrentBudget();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transaction.date || new Date().toISOString(),
    };

    setState((prev) => {
      // Update account balance if accountId is provided
      let updatedAccounts = prev.accounts || [];
      if (transaction.accountId) {
        updatedAccounts = updatedAccounts.map((acc) => {
          if (acc.id === transaction.accountId) {
            let newBalance = acc.balance;
            if (transaction.type === 'income') {
              newBalance += transaction.amount;
            } else if (transaction.type === 'expense' || transaction.type === 'investment' || transaction.type === 'savings') {
              newBalance -= transaction.amount;
            }
            return { ...acc, balance: newBalance };
          }
          return acc;
        });
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        budgets: prev.budgets.map((b) =>
          b.id === budget.id
            ? { ...b, transactions: [...b.transactions, newTransaction] }
            : b
        ).concat(
          prev.budgets.find((b) => b.id === budget.id)
            ? []
            : [{ ...budget, transactions: [newTransaction] }]
        ),
      };
    });
  };

  const removeTransaction = (transactionId: string) => {
    setState((prev) => {
      // Find the transaction to get its details before removing
      let transactionToRemove: Transaction | undefined;
      for (const budget of prev.budgets) {
        transactionToRemove = budget.transactions.find((t) => t.id === transactionId);
        if (transactionToRemove) break;
      }

      // Revert account balance if the transaction had an accountId
      let updatedAccounts = prev.accounts || [];
      if (transactionToRemove?.accountId) {
        updatedAccounts = updatedAccounts.map((acc) => {
          if (acc.id === transactionToRemove!.accountId) {
            let newBalance = acc.balance;
            // Reverse the original transaction effect
            if (transactionToRemove!.type === 'income') {
              newBalance -= transactionToRemove!.amount;
            } else if (transactionToRemove!.type === 'expense' || transactionToRemove!.type === 'investment' || transactionToRemove!.type === 'savings') {
              newBalance += transactionToRemove!.amount;
            }
            return { ...acc, balance: newBalance };
          }
          return acc;
        });
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        budgets: prev.budgets.map((b) => ({
          ...b,
          transactions: b.transactions.filter((t) => t.id !== transactionId),
        })),
      };
    });
  };

  const addCategory = (type: 'income' | 'expense' | 'investment' | 'savings', category: Category) => {
    if (state.savedCategories[type].some((c) => c.name === category.name)) return;

    setState((prev) => ({
      ...prev,
      savedCategories: {
        ...prev.savedCategories,
        [type]: [...prev.savedCategories[type], category],
      },
    }));
  };

  const removeCategory = (type: 'income' | 'expense' | 'investment' | 'savings', categoryName: string) => {
    setState((prev) => ({
      ...prev,
      savedCategories: {
        ...prev.savedCategories,
        [type]: prev.savedCategories[type].filter((c) => c.name !== categoryName),
      },
    }));
  };

  const getBalance = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions.reduce((acc, t) => {
      // Exclude "from previous period" transactions from balance
      if (t.isFromPreviousPeriod) return acc;
      if (t.type === 'income') return acc + t.amount;
      // Withdrawal transactions (isWithdrawal: true) should NOT decrease balance
      // as they represent funds being transferred TO balance (already counted via income transaction)
      if ((t.type === 'investment' || t.type === 'savings') && t.isWithdrawal) return acc;
      if (t.type === 'expense' || t.type === 'investment' || t.type === 'savings') return acc - t.amount;
      return acc;
    }, 0);
  };

  const getTotalIncome = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getTotalExpense = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getTotalInvestment = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    // Include investments but subtract withdrawals
    const invested = b.transactions
      .filter((t) => t.type === 'investment' && !t.isFromPreviousPeriod && !t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const withdrawn = b.transactions
      .filter((t) => t.type === 'investment' && t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);

    return Math.max(0, invested - withdrawn);
  };

  const getInvestmentFromPreviousPeriod = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions
      .filter((t) => t.type === 'investment' && t.isFromPreviousPeriod)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getTotalSavings = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    // Include savings but subtract withdrawals
    const saved = b.transactions
      .filter((t) => t.type === 'savings' && !t.isFromPreviousPeriod && !t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const withdrawn = b.transactions
      .filter((t) => t.type === 'savings' && t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);

    return Math.max(0, saved - withdrawn);
  };

  const getSavingsFromPreviousPeriod = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions
      .filter((t) => t.type === 'savings' && t.isFromPreviousPeriod)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getPastBudgets = (): MonthlyBudget[] => {
    const now = new Date();
    return state.budgets
      .filter(
        (b) =>
          b.year < now.getFullYear() ||
          (b.year === now.getFullYear() && b.month < now.getMonth())
      )
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  };

  const getPreviousMonthBudget = (): MonthlyBudget | undefined => {
    let prevMonth = state.currentMonth - 1;
    let prevYear = state.currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    return state.budgets.find((b) => b.month === prevMonth && b.year === prevYear);
  };

  const getPreviousMonthBalance = (): number => {
    const prevBudget = getPreviousMonthBudget();
    return getBalance(prevBudget);
  };

  // Get the balance as it was on the last day of the previous month (excluding any transfers that happened after)
  const getLastDayOfPreviousMonthBalance = (): number => {
    const prevBudget = getPreviousMonthBudget();
    if (!prevBudget) return 0;

    // Calculate balance from transactions, excluding those marked as isFromPreviousPeriod
    return prevBudget.transactions.reduce((acc, t) => {
      if (t.isFromPreviousPeriod) return acc;
      if (t.type === 'income') return acc + t.amount;
      if ((t.type === 'investment' || t.type === 'savings') && t.isWithdrawal) return acc;
      if (t.type === 'expense' || t.type === 'investment' || t.type === 'savings') return acc - t.amount;
      return acc;
    }, 0);
  };

  const carryOverBalance = () => {
    const prevBalance = getPreviousMonthBalance();
    if (prevBalance === 0) return false;

    const budget = getOrCreateCurrentBudget();
    
    // Check if already carried over
    const hasCarryOver = budget.transactions.some(
      (t) => t.category === 'Prijenos iz prethodnog mjeseca'
    );
    if (hasCarryOver) return false;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      name: 'Prijenos iz prethodnog mjeseca',
      amount: Math.abs(prevBalance),
      type: prevBalance > 0 ? 'income' : 'expense',
      category: 'Prijenos iz prethodnog mjeseca',
      date: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.id === budget.id
          ? { ...b, transactions: [...b.transactions, newTransaction] }
          : b
      ).concat(
        prev.budgets.find((b) => b.id === budget.id)
          ? []
          : [{ ...budget, transactions: [newTransaction] }]
      ),
    }));

    return true;
  };

  const setCurrentPeriod = (month: number, year: number) => {
    setState((prev) => ({
      ...prev,
      currentMonth: month,
      currentYear: year,
    }));
  };

  const setDefaultLimits = (limits: BudgetLimits) => {
    setState((prev) => ({
      ...prev,
      defaultLimits: limits,
    }));
  };

  const getCurrentLimits = (): BudgetLimits => {
    const budget = getCurrentBudget();
    return budget?.limits || state.defaultLimits;
  };

  const getBudgetProgress = (type: 'expense' | 'investment' | 'savings'): { spent: number; limit: number; percentage: number } => {
    const limits = getCurrentLimits();
    const limit = limits[type];
    let spent = 0;
    
    if (type === 'expense') spent = getTotalExpense();
    else if (type === 'investment') spent = getTotalInvestment();
    else if (type === 'savings') spent = getTotalSavings();
    
    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    return { spent, limit, percentage };
  };

  const addRecurringTransaction = (transaction: Omit<RecurringTransaction, 'id' | 'isActive'>) => {
    const newRecurring: RecurringTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      isActive: true,
    };

    setState((prev) => ({
      ...prev,
      recurringTransactions: [...prev.recurringTransactions, newRecurring],
    }));
  };

  const removeRecurringTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.filter((r) => r.id !== id),
    }));
  };

  const toggleRecurringTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ),
    }));
  };

  const updateRecurringTransaction = (id: string, updates: Partial<Omit<RecurringTransaction, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  };

  const applyRecurringTransactions = () => {
    const budget = getOrCreateCurrentBudget();
    
    // Check if already applied for this month
    if (budget.recurringApplied) return false;

    const activeRecurring = state.recurringTransactions.filter((r) => r.isActive);
    if (activeRecurring.length === 0) return false;

    // Use the first day of current month as the date
    const firstOfMonth = new Date(state.currentYear, state.currentMonth, 1);
    
    const newTransactions: Transaction[] = activeRecurring.map((r) => ({
      id: crypto.randomUUID(),
      name: r.name,
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: firstOfMonth.toISOString(),
      accountId: r.accountId,
    }));

    setState((prev) => {
      // Update account balances for recurring transactions
      let updatedAccounts = prev.accounts || [];
      for (const rt of newTransactions) {
        if (rt.accountId) {
          updatedAccounts = updatedAccounts.map((acc) => {
            if (acc.id === rt.accountId) {
              let newBalance = acc.balance;
              if (rt.type === 'income') {
                newBalance += rt.amount;
              } else {
                newBalance -= rt.amount;
              }
              return { ...acc, balance: newBalance };
            }
            return acc;
          });
        }
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        budgets: prev.budgets.map((b) =>
          b.id === budget.id
            ? { ...b, transactions: [...b.transactions, ...newTransactions], recurringApplied: true }
            : b
        ).concat(
          prev.budgets.find((b) => b.id === budget.id)
            ? []
            : [{ ...budget, transactions: newTransactions, recurringApplied: true }]
        ),
      };
    });

    return true;
  };

  const removeBudget = (budgetId: string) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== budgetId),
    }));
  };

  const transferFromCategory = (type: 'investment' | 'savings', amount: number, targetAccountId?: string): boolean => {
    const budget = getCurrentBudget();
    if (!budget) return false;

    // Calculate available amount in the category
    const availableAmount = type === 'investment' 
      ? getTotalInvestment() + getInvestmentFromPreviousPeriod()
      : getTotalSavings() + getSavingsFromPreviousPeriod();

    if (amount <= 0 || amount > availableAmount) return false;

    // Use the first available account if no target account specified
    const accountId = targetAccountId || (state.accounts && state.accounts.length > 0 ? state.accounts[0].id : undefined);

    // Create two transactions:
    // 1. Negative transaction in the category (withdrawal)
    // 2. Income transaction (transfer to balance)
    const withdrawalTransaction: Transaction = {
      id: crypto.randomUUID(),
      name: type === 'investment' ? 'Prijenos na stanje' : 'Prijenos na stanje',
      amount: amount,
      type: type,
      category: 'Prijenos na stanje',
      date: new Date().toISOString(),
      isWithdrawal: true, // Mark as withdrawal so it reduces the category total
    };

    const incomeTransaction: Transaction = {
      id: crypto.randomUUID(),
      name: type === 'investment' ? 'Prijenos iz investicija' : 'Prijenos iz štednje',
      amount: amount,
      type: 'income',
      category: type === 'investment' ? 'Prijenos iz investicija' : 'Prijenos iz štednje',
      date: new Date().toISOString(),
      accountId: accountId, // Add to account balance
    };

    setState((prev) => {
      // Update account balance if accountId is provided
      let updatedAccounts = prev.accounts || [];
      if (accountId) {
        updatedAccounts = updatedAccounts.map((acc) => {
          if (acc.id === accountId) {
            return { ...acc, balance: acc.balance + amount };
          }
          return acc;
        });
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        budgets: prev.budgets.map((b) =>
          b.id === budget.id
            ? { ...b, transactions: [...b.transactions, withdrawalTransaction, incomeTransaction] }
            : b
        ),
      };
    });

    return true;
  };

  const getAvailableInvestment = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    // Include both current month investments and previous period investments
    const invested = b.transactions
      .filter((t) => t.type === 'investment' && !t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const withdrawn = b.transactions
      .filter((t) => t.type === 'investment' && t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);

    return Math.max(0, invested - withdrawn);
  };

  const getAvailableSavings = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    // Include both current month savings and previous period savings
    const saved = b.transactions
      .filter((t) => t.type === 'savings' && !t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const withdrawn = b.transactions
      .filter((t) => t.type === 'savings' && t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);

    return Math.max(0, saved - withdrawn);
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: crypto.randomUUID(),
    };

    setState((prev) => ({
      ...prev,
      accounts: [...(prev.accounts || []), newAccount],
    }));
  };

  const removeAccount = (accountId: string) => {
    setState((prev) => ({
      ...prev,
      accounts: (prev.accounts || []).filter((a) => a.id !== accountId),
    }));
  };

  const updateAccount = (accountId: string, updates: Partial<Omit<Account, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      accounts: (prev.accounts || []).map((a) =>
        a.id === accountId ? { ...a, ...updates } : a
      ),
    }));
  };

  const transferBetweenAccounts = (fromAccountId: string, toAccountId: string, amount: number): boolean => {
    const fromAccount = state.accounts?.find((a) => a.id === fromAccountId);
    const toAccount = state.accounts?.find((a) => a.id === toAccountId);

    if (!fromAccount || !toAccount || amount <= 0 || fromAccount.balance < amount) {
      return false;
    }

    setState((prev) => ({
      ...prev,
      accounts: (prev.accounts || []).map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      }),
    }));

    return true;
  };

  const addReminder = (reminder: Omit<PaymentReminder, 'id' | 'isCompleted' | 'createdAt'>) => {
    const newReminder: PaymentReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      reminders: [...(prev.reminders || []), newReminder],
    }));
  };

  const removeReminder = (reminderId: string) => {
    setState((prev) => ({
      ...prev,
      reminders: (prev.reminders || []).filter((r) => r.id !== reminderId),
    }));
  };

  const completeReminder = (reminderId: string) => {
    setState((prev) => ({
      ...prev,
      reminders: (prev.reminders || []).map((r) =>
        r.id === reminderId ? { ...r, isCompleted: true } : r
      ),
    }));
  };

  const getActiveReminders = (): PaymentReminder[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (state.reminders || []).filter((r) => {
      if (r.isCompleted) return false;
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    });
  };

  const getUpcomingReminders = (): PaymentReminder[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (state.reminders || []).filter((r) => {
      if (r.isCompleted) return false;
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today;
    });
  };

  return {
    state,
    getCurrentBudget,
    getOrCreateCurrentBudget,
    addTransaction,
    removeTransaction,
    addCategory,
    removeCategory,
    getBalance,
    getTotalIncome,
    getTotalExpense,
    getTotalInvestment,
    getTotalSavings,
    getInvestmentFromPreviousPeriod,
    getSavingsFromPreviousPeriod,
    getPastBudgets,
    getPreviousMonthBalance,
    getLastDayOfPreviousMonthBalance,
    carryOverBalance,
    setCurrentPeriod,
    setDefaultLimits,
    getCurrentLimits,
    getBudgetProgress,
    addRecurringTransaction,
    removeRecurringTransaction,
    toggleRecurringTransaction,
    updateRecurringTransaction,
    applyRecurringTransactions,
    removeBudget,
    transferFromCategory,
    getAvailableInvestment,
    getAvailableSavings,
    addAccount,
    removeAccount,
    updateAccount,
    transferBetweenAccounts,
    addReminder,
    removeReminder,
    completeReminder,
    getActiveReminders,
    getUpcomingReminders,
    syncStatus,
    syncNow,
    canSync,
    groupId,
    lastSyncedAt,
    resetAll: async () => {
      // Clear cloud data first if syncing
      if (canSync && userId) {
        try {
          if (groupId) {
            await (supabase
              .from('group_data' as any)
              .update({ data: getInitialState() as any }) as any)
              .eq('group_id', groupId);
          } else {
            await supabase
              .from('user_data')
              .update({ data: getInitialState() as any })
              .eq('user_id', userId);
          }
        } catch (err) {
          console.error('Failed to reset cloud data:', err);
        }
      }
      // Clear localStorage and reload
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    },
  };
};
