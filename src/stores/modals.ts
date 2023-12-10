import { writable } from "svelte/store";
import type { Expense, ExpenseType } from "@/types";

export interface ExpenseModalState {
  type: "add" | "edit";
  init?: Expense;
}

export const expenseModalState = writable<ExpenseModalState | false>(false);

export interface ExpenseTypeModalState {
  type: "add" | "edit";
  init?: ExpenseType;
}

export const expenseTypeModalState = writable<ExpenseTypeModalState | false>(
  false,
);
