import { type Expense } from "@/types";
import { writable } from "svelte/store";

export type ExpenseState = Omit<
  Expense,
  "id" | "createdAt" | "normalizedDate" | "items"
> & { items: string[] };

export const useExpenseStates = () => {
  const expense = writable<ExpenseState>({
    amount: 0,
    note: "",
    type: "",
    items: [],
  });

  return expense;
};
