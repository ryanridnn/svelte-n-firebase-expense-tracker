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
} from "firebase/firestore";
import moment from "moment";
import { getSnapsData, groupBasedOnKey } from "../helpers";

export interface ExpensePayload extends Omit<Expense, "id" | "createdAt"> {}

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

  return grouped;
};
