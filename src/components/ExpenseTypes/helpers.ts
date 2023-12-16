// stores
import { monthYear } from "@/stores/monthYear";
import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";

// types
import type { ExpenseTypeModalState } from "@/stores/modals";
import type { MonthlyExpenseType } from "@/types";
import type { ExpenseTypeModalState } from "@/stores/modals";
import type { ExpenseTypeChanged } from "@/firebase/monthlyExpenseTypes";

export const getModalMode = (modalState: ExpenseTypeModalState | false) => {
  if (modalState) {
    if (modalState.type === "add") {
      return "add";
    } else {
      return "edit";
    }
  } else {
    return "add";
  }
};

export const reflectExpenseTypeEdit = (
  newExpenseType: EditExpenseTypePayload,
  changed: ExpenseTypeChanged,
) => {
  monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
    return currentMonthlyExpenseTypes.map((each) => {
      if (each.id === newExpenseType.id) {
        return {
          ...each,
          name: newExpenseType.name,
          limit: newExpenseType.limit,
        };
      } else {
        return each;
      }
    });
  });

  if (changed.limit) {
    const diff = newExpenseType.limit - newExpenseType.initLimit;

    monthYear.update((currentMonthYear) => {
      if (currentMonthYear) {
        return {
          ...currentMonthYear,
          limit: currentMonthYear.limit + diff,
        };
      } else {
        return currentMonthYear;
      }
    });
  }
};

export const reflectDeletedExpenseType = (
  currentExpenseType: MonthlyExpenseType,
) => {
  monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
    return currentMonthlyExpenseTypes.filter(
      (each) => each.id !== currentExpenseType.id,
    );
  });

  monthYear.update((currentMonthYear) => {
    if (currentMonthYear) {
      return {
        ...currentMonthYear,
        limit: currentMonthYear.limit - currentExpenseType.limit,
      };
    } else {
      return currentMonthYear;
    }
  });
};
