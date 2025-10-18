import type { ExpenseType, Shortcut } from "@/types";

export const getShortcutsData = (
  shortcuts: Shortcut[],
  expenseTypes: ExpenseType[],
) => {
  if (expenseTypes) {
    return shortcuts.map((shortcut) => {
      const match = expenseTypes.find(
        (expenseType) => expenseType.id === shortcut.type,
      );

      if (match) {
        return {
          ...shortcut,
          expenseType: match,
        };
      } else {
        return shortcut;
      }
    });
  } else {
    return shortcuts;
  }
};
