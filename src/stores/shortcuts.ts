import type { Shortcut } from "@/types";
import { writable } from "svelte/store";

export interface ShortcutState {
  loading: boolean;
  list: Shortcut[];
}

export const shortcuts = writable<ShortcutState>({
  loading: true,
  list: []
});
