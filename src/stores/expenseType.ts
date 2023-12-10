import { writable } from "svelte/store";
import type { ExpenseType } from "@/types";

export const globalExpenseTypes = writable<ExpenseType[]>([]);
