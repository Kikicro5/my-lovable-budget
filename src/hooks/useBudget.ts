import { useState, useEffect } from 'react';
import { BudgetState, MonthlyBudget, Transaction, Category, BudgetLimits, RecurringTransaction } from '@/types/budget';

const STORAGE_KEY = 'monthly-budget-app';

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
  };
};

// Helper to migrate old string categories to new Category format
const migrateCategories = (categories: (string | Category)[]): Category[] => {
  return categories.map((cat) =>
    typeof cat === 'string' ? { name: cat } : cat
  );
};

export const useBudget = () => {
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
        };
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

  // Track if auto carry-over happened
  const [autoCarryOverAmount, setAutoCarryOverAmount] = useState<number | null>(null);

  // Auto-archive previous month and carry over balance when month changes
  useEffect(() => {
    const now = new Date();
    const realMonth = now.getMonth();
    const realYear = now.getFullYear();

    // Check if state month/year is behind real date
    const isNewMonth = 
      realYear > state.currentYear || 
      (realYear === state.currentYear && realMonth > state.currentMonth);

    if (isNewMonth) {
      // Get the previous period (which was the "current" in state)
      const previousBudget = state.budgets.find(
        (b) => b.month === state.currentMonth && b.year === state.currentYear
      );
      
      const previousBalance = previousBudget 
        ? previousBudget.transactions.reduce((acc, t) => {
            if (t.isFromPreviousPeriod) return acc;
            if (t.type === 'income') return acc + t.amount;
            if (t.type === 'expense' || t.type === 'investment' || t.type === 'savings') return acc - t.amount;
            return acc;
          }, 0)
        : 0;

      // Check if carry-over already exists in the new month
      const newBudgetId = `${realYear}-${realMonth}`;
      const existingNewBudget = state.budgets.find((b) => b.month === realMonth && b.year === realYear);
      const hasCarryOver = existingNewBudget?.transactions.some(
        (t) => t.category === 'Prijenos iz prethodnog mjeseca'
      );

      // Update to current real month and create carry-over transaction if there's a balance
      setState((prev) => {
        let updatedBudgets = prev.budgets;

        if (previousBalance !== 0 && !hasCarryOver) {
          const carryOverTransaction: Transaction = {
            id: crypto.randomUUID(),
            name: 'Prijenos iz prethodnog mjeseca',
            amount: Math.abs(previousBalance),
            type: previousBalance > 0 ? 'income' : 'expense',
            category: 'Prijenos iz prethodnog mjeseca',
            date: new Date().toISOString(),
          };

          if (existingNewBudget) {
            updatedBudgets = prev.budgets.map((b) =>
              b.id === newBudgetId
                ? { ...b, transactions: [...b.transactions, carryOverTransaction] }
                : b
            );
          } else {
            const newBudget: MonthlyBudget = {
              id: newBudgetId,
              month: realMonth,
              year: realYear,
              transactions: [carryOverTransaction],
              savedCategories: { ...prev.savedCategories },
            };
            updatedBudgets = [...prev.budgets, newBudget];
          }

          // Set the amount for notification
          setAutoCarryOverAmount(previousBalance);
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const budget = getOrCreateCurrentBudget();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
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
  };

  const removeTransaction = (transactionId: string) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) => ({
        ...b,
        transactions: b.transactions.filter((t) => t.id !== transactionId),
      })),
    }));
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

    return b.transactions
      .filter((t) => t.type === 'investment' && !t.isFromPreviousPeriod)
      .reduce((acc, t) => acc + t.amount, 0);
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

    return b.transactions
      .filter((t) => t.type === 'savings' && !t.isFromPreviousPeriod)
      .reduce((acc, t) => acc + t.amount, 0);
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

  const applyRecurringTransactions = () => {
    const budget = getOrCreateCurrentBudget();
    
    // Check if already applied for this month
    if (budget.recurringApplied) return false;

    const activeRecurring = state.recurringTransactions.filter((r) => r.isActive);
    if (activeRecurring.length === 0) return false;

    const newTransactions: Transaction[] = activeRecurring.map((r) => ({
      id: crypto.randomUUID(),
      name: r.name,
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: new Date().toISOString(),
    }));

    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.id === budget.id
          ? { ...b, transactions: [...b.transactions, ...newTransactions], recurringApplied: true }
          : b
      ).concat(
        prev.budgets.find((b) => b.id === budget.id)
          ? []
          : [{ ...budget, transactions: newTransactions, recurringApplied: true }]
      ),
    }));

    return true;
  };

  const removeBudget = (budgetId: string) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== budgetId),
    }));
  };

  const transferFromCategory = (type: 'investment' | 'savings', amount: number): boolean => {
    const budget = getCurrentBudget();
    if (!budget) return false;

    // Calculate available amount in the category
    const availableAmount = type === 'investment' 
      ? getTotalInvestment() + getInvestmentFromPreviousPeriod()
      : getTotalSavings() + getSavingsFromPreviousPeriod();

    if (amount <= 0 || amount > availableAmount) return false;

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
    };

    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.id === budget.id
          ? { ...b, transactions: [...b.transactions, withdrawalTransaction, incomeTransaction] }
          : b
      ),
    }));

    return true;
  };

  const getAvailableInvestment = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    const invested = b.transactions
      .filter((t) => t.type === 'investment' && !t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const withdrawn = b.transactions
      .filter((t) => t.type === 'investment' && t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);

    return invested - withdrawn;
  };

  const getAvailableSavings = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    const saved = b.transactions
      .filter((t) => t.type === 'savings' && !t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const withdrawn = b.transactions
      .filter((t) => t.type === 'savings' && t.isWithdrawal)
      .reduce((acc, t) => acc + t.amount, 0);

    return saved - withdrawn;
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
    carryOverBalance,
    setCurrentPeriod,
    setDefaultLimits,
    getCurrentLimits,
    getBudgetProgress,
    addRecurringTransaction,
    removeRecurringTransaction,
    toggleRecurringTransaction,
    applyRecurringTransactions,
    removeBudget,
    transferFromCategory,
    getAvailableInvestment,
    getAvailableSavings,
    autoCarryOverAmount,
    clearAutoCarryOverAmount: () => setAutoCarryOverAmount(null),
  };
};
