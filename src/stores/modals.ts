import { writable } from "svelte/store";
import type { Expense, MonthlyExpenseType, Shortcut } from "@/types";

export interface ExpenseModalState {
  type: "add" | "edit";
  init?: Expense;
  shortcut?: Shortcut
}

export const expenseModalState = writable<ExpenseModalState | false>(false);

export interface ExpenseTypeModalState {
  type: "add" | "edit";
  init?: MonthlyExpenseType;
}

export const expenseTypeModalState = writable<ExpenseTypeModalState | false>(
  false,
);

export interface ShortcutModalState {
  type: "add" | "edit";
  init?: Shortcut;
}

export const shortcutModalState = writable<ShortcutModalState | false>(false);
