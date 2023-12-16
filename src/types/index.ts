export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MonthYear {
  id: string;
  amount: number;
  year: number;
  month: string;
  limit: number;
  notExist?: boolean;
}

export interface ExpenseType {
  id: string;
  name: string;
  limit: number;
}

export interface MonthlyExpenseType {
  id: string;
  name: string;
  amount: number;
  limit: number;
}

export interface Expense {
  id: string;
  amount: number;
  note: string;
  type: string;
  expenseType?: MonthlyExpenseType;
  createdAt: string;
  normalizedDate: string;
}

export interface Grouped<T, U> {
  title: U;
  list: T[];
}
