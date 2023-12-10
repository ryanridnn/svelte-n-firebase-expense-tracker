import type { MonthlyExpenseType } from "@/types";
import { writable } from "svelte/store";

export const monthlyExpenseTypes = writable<MonthlyExpenseType[]>([]);
