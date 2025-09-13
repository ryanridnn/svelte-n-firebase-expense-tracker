import type { Expense, MonthlyExpenseType } from "@/types";
import { db } from "..";
import { DB_COLLECTIONS } from "@/const";
import {
  collection,
  doc,
  increment,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import moment from "moment";
import { getSnapsData, groupBasedOnKey } from "../helpers";
import { expenseModalState } from "@/stores/modals";

export interface ExpensePayload extends Omit<Expense, "id" | "createdAt"> { }

export const createNewExpense = async (
  userId: string,
  monthYearId: string,
  expensePayload: ExpensePayload,
): Promise<Expense> => {
  const typeId = expensePayload.type;

  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
  );
  // const expenseTypeRef = doc(db, DB_COLLECTIONS.Users, userId, DB_COLLECTIONS.expenseType, typeId)
  const monthlyExpenseTypeRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.monthlyExpenseType,
    typeId,
  );
  const expenseCollectionsRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.expense,
  );

  const newExpenseSnap = await addDoc(expenseCollectionsRef, {
    ...expensePayload,
    createdAt: serverTimestamp(),
  });
  const amountPayload = {
    amount: increment(expensePayload.amount),
  };

  await updateDoc(monthYearRef, amountPayload);
  await updateDoc(monthlyExpenseTypeRef, amountPayload);

  return {
    id: newExpenseSnap.id,
    ...expensePayload,
    createdAt: moment().toISOString(),
  };
};

interface DBExpense extends Omit<Expense, "createdAt"> {
  createdAt: Timestamp;
}

export const getExpenses = async (
  userId: string,
  monthYearId: string,
  monthlyExpenseTypes: MonthlyExpenseType[],
) => {
  const expenseCollectionRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.expense,
  );

  const expenseSnaps = await getDocs(expenseCollectionRef);
  const expenses = getSnapsData(expenseSnaps)
    .sort(
      (a: DBExpense, b: DBExpense) => b.createdAt.seconds - a.createdAt.seconds,
    )
    .map((expense: DBExpense): Expense => {
      const match = monthlyExpenseTypes.find(
        (monthlyExpenseType) => monthlyExpenseType.id === expense.type,
      );
      const newExpense: Expense = {
        ...expense,
        createdAt: moment.unix(expense.createdAt.seconds).toISOString(),
      };

      if (match) {
        newExpense.expenseType = match;
      }

      return newExpense;
    });

  const grouped = groupBasedOnKey<Expense, string>(expenses, "normalizedDate");

  const mapped = grouped.map(group => {
    const total = group.list.reduce((acc, row) => acc + row.amount, 0)

    return {
      ...group,
      total
    }
  })

  return mapped;
};

export interface ExpenseChanged {
  overall: boolean;
  amount: boolean;
  note: boolean;
  items: boolean;
  type: boolean;
}

export interface EditExpensePayload
  extends Omit<Expense, "expenseType" | "createdAt" | "normalizedDate"> {
  initAmount: number;
  initType: string;
}

export const editExpense = async (
  userId: string,
  monthYearId: string,
  expense: EditExpensePayload,
  changed: ExpenseChanged,
) => {
  const diff = expense.amount - expense.initAmount;

  if (changed.amount) {
    await changeMonthYearAmount(userId, monthYearId, diff);
  }

  if (changed.type) {
    await changeMonthlyExpenseTypeAmount(
      userId,
      monthYearId,
      expense.initType,
      -1 * expense.initAmount,
    );
    await changeMonthlyExpenseTypeAmount(
      userId,
      monthYearId,
      expense.type,
      expense.amount,
    );
  } else if (changed.amount) {
    await changeMonthlyExpenseTypeAmount(
      userId,
      monthYearId,
      expense.type,
      diff,
    );
  }

  const expenseRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.expense,
    expense.id,
  );
  await updateDoc(expenseRef, {
    amount: expense.amount,
    note: expense.note,
    type: expense.type,
    items: expense.items,
  });
};

const changeMonthYearAmount = async (
  userId: string,
  monthYearId: string,
  diff: number,
) => {
  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
  );

  await updateDoc(monthYearRef, {
    amount: increment(diff),
  });
};

const changeMonthlyExpenseTypeAmount = async (
  userId: string,
  monthYearId: string,
  expenseTypeId: string,
  diff: number,
) => {
  const monthlyExpenseTypeRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.monthlyExpenseType,
    expenseTypeId,
  );

  await updateDoc(monthlyExpenseTypeRef, {
    amount: increment(diff),
  });
};

export const deleteExpense = async (
  userId: string,
  monthYearId: string,
  expense: Expense,
) => {
  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
  );
  const expenseRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.expense,
    expense.id,
  );
  const monthlyExpenseTypeRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.monthlyExpenseType,
    expense.type,
  );

  const payload = {
    amount: increment(-1 * expense.amount),
  };

  await updateDoc(monthYearRef, payload);
  await updateDoc(monthlyExpenseTypeRef, payload);

  await deleteDoc(expenseRef);
};
