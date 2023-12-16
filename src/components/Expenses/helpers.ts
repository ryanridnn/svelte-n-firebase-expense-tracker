// stores
import { monthYear } from "@/stores/monthYear";
import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";
import { expenses } from "@/stores/expenses";

// types
import type { ExpenseChanged } from "@/firebase/expenses";
import type { ExpenseModalState } from "@/stores/modals";
import type { Expense } from "@/types";
import type { EditExpensePayload } from "@/firebase/expenses";

export interface ValidateChangeProps {
  expenseModalState: ExpenseModalState;
  amount: number;
  note: string;
  type: string;
}

export const validateChange = ({
  expenseModalState,
  amount,
  note,
  type,
}: ValidateChangeProps) => {
  const changed: ExpenseChanged = {
    amount: false,
    note: false,
    type: false,
    overall: false,
  };

  if (
    expenseModalState &&
    expenseModalState.type === "edit" &&
    expenseModalState.init
  ) {
    const currentExpense = expenseModalState.init;

    if (amount !== currentExpense.amount) {
      changed.amount = true;
    }

    if (note !== currentExpense.note) {
      changed.note = true;
    }

    if (type !== currentExpense.type) {
      changed.type = true;
    }

    changed.overall = changed.amount || changed.note || changed.type;

    return changed;
  } else {
    return changed;
  }
};

export const getModalMode = (modalState: ExpenseModalState | false) => {
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

export const reflectEditedExpense = (
  newExpense: EditExpensePayload,
  changed: ExpenseChanged,
  date: string,
) => {
  if (changed.amount) {
    const diff = newExpense.amount - newExpense.initAmount;

    monthYear.update((currentMonthYear) => {
      if (currentMonthYear) {
        return {
          ...currentMonthYear,
          amount: currentMonthYear.amount + diff,
        };
      } else {
        return currentMonthYear;
      }
    });
  }

  if (changed.type) {
    monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
      return currentMonthlyExpenseTypes.map((each) => {
        if (each.id === newExpense.initType) {
          return {
            ...each,
            amount: each.amount - 1 * newExpense.initAmount,
          };
        } else if (each.id === newExpense.type) {
          return {
            ...each,
            amount: each.amount + newExpense.amount,
          };
        } else {
          return each;
        }
      });
    });
  } else if (changed.amount) {
    const diff = newExpense.amount - newExpense.initAmount;
    monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
      return currentMonthlyExpenseTypes.map((each) => {
        if (each.id == newExpense.type) {
          return {
            ...each,
            amount: each.amount + diff,
          };
        } else {
          return each;
        }
      });
    });
  }

  expenses.update((currentGroupedExpensesArr) => {
    return currentGroupedExpensesArr.map((eachGroup) => {
      if (eachGroup.title === date) {
        return {
          ...eachGroup,
          list: eachGroup.list.map((eachExpense) => {
            if (eachExpense.id === newExpense.id) {
              return {
                ...eachExpense,
                amount: newExpense.amount,
                note: newExpense.note,
                type: newExpense.type,
              };
            } else {
              return eachExpense;
            }
          }),
        };
      } else {
        return eachGroup;
      }
    });
  });
};

export const reflectDeletedExpense = (currentExpense: Expense) => {
  monthYear.update((currentMonthYear) => {
    if (currentMonthYear) {
      return {
        ...currentMonthYear,
        amount: currentMonthYear.amount - currentExpense.amount,
      };
    } else {
      return currentMonthYear;
    }
  });

  monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
    return currentMonthlyExpenseTypes.map((monthlyExpenseType) => {
      if (monthlyExpenseType.id === currentExpense.id) {
        return {
          ...monthlyExpenseType,
          amount: monthlyExpenseType.amount - currentExpense.amount,
        };
      } else {
        return monthlyExpenseType;
      }
    });
  });

  expenses.update((currentGroupedExpensesArr) => {
    return currentGroupedExpensesArr.map((eachGroup) => {
      if (eachGroup.title === currentExpense.normalizedDate) {
        return {
          ...eachGroup,
          list: eachGroup.list.filter(
            (eachExpense) => eachExpense.id !== currentExpense.id,
          ),
        };
      } else {
        return eachGroup;
      }
    });
  });
};
