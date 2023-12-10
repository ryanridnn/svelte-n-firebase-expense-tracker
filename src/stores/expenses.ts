import type { Grouped, Expense } from "@/types";
import { writable } from "svelte/store";

export interface GroupedExpenses extends Grouped<Expense, string> {}

export const expenses = writable<GroupedExpenses[]>([]);
