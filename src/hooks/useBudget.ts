import { useState, useEffect } from 'react';
import { BudgetState, MonthlyBudget, Transaction, Category } from '@/types/budget';

const STORAGE_KEY = 'monthly-budget-app';

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
        };
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

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
      .filter((t) => t.type === 'investment')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getTotalSavings = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions
      .filter((t) => t.type === 'savings')
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

  const setCurrentPeriod = (month: number, year: number) => {
    setState((prev) => ({
      ...prev,
      currentMonth: month,
      currentYear: year,
    }));
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
    getPastBudgets,
    setCurrentPeriod,
  };
};
