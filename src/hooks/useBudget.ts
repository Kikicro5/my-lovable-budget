import { useState, useEffect } from 'react';
import { BudgetState, MonthlyBudget, Transaction } from '@/types/budget';

const STORAGE_KEY = 'monthly-budget-app';

const getInitialState = (): BudgetState => {
  const now = new Date();
  return {
    currentMonth: now.getMonth(),
    currentYear: now.getFullYear(),
    budgets: [],
    savedCategories: {
      income: ['Plaća', 'Bonus', 'Freelance', 'Dividende', 'Ostalo'],
      expense: ['Režije', 'Hrana', 'Transport', 'Zabava', 'Zdravlje', 'Odjeća', 'Ostalo'],
    },
  };
};

export const useBudget = () => {
  const [state, setState] = useState<BudgetState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
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

  const addCategory = (type: 'income' | 'expense', category: string) => {
    if (state.savedCategories[type].includes(category)) return;

    setState((prev) => ({
      ...prev,
      savedCategories: {
        ...prev.savedCategories,
        [type]: [...prev.savedCategories[type], category],
      },
    }));
  };

  const removeCategory = (type: 'income' | 'expense', category: string) => {
    setState((prev) => ({
      ...prev,
      savedCategories: {
        ...prev.savedCategories,
        [type]: prev.savedCategories[type].filter((c) => c !== category),
      },
    }));
  };

  const getBalance = (budget?: MonthlyBudget): number => {
    const b = budget || getCurrentBudget();
    if (!b) return 0;

    return b.transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
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
    getPastBudgets,
    setCurrentPeriod,
  };
};
