export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface MonthlyBudget {
  id: string;
  month: number;
  year: number;
  transactions: Transaction[];
  savedCategories: {
    income: string[];
    expense: string[];
  };
}

export interface BudgetState {
  currentMonth: number;
  currentYear: number;
  budgets: MonthlyBudget[];
  savedCategories: {
    income: string[];
    expense: string[];
  };
}
