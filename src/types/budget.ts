export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'investment' | 'savings';
  category: string;
  date: string;
}

export interface Category {
  name: string;
  description?: string;
}

export interface BudgetLimits {
  expense: number;
  investment: number;
  savings: number;
}

export interface MonthlyBudget {
  id: string;
  month: number;
  year: number;
  transactions: Transaction[];
  savedCategories: {
    income: Category[];
    expense: Category[];
    investment: Category[];
    savings: Category[];
  };
  limits?: BudgetLimits;
}

export interface BudgetState {
  currentMonth: number;
  currentYear: number;
  budgets: MonthlyBudget[];
  savedCategories: {
    income: Category[];
    expense: Category[];
    investment: Category[];
    savings: Category[];
  };
  defaultLimits: BudgetLimits;
}