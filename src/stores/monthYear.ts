import { writable } from "svelte/store";
import type { MonthYear } from "@/types";

export const monthYear = writable<MonthYear | null>(null);
