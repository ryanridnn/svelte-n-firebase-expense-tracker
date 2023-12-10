import type { Grouped, Expense } from "@/types";
import { writable } from "svelte/store";

export const expenses = writable<Grouped<Expense, string>[]>([]);
