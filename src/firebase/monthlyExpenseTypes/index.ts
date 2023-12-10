import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase";
import { DB_COLLECTIONS } from "@/const";
import { getSnapsData } from "@/firebase/helpers";
import type { ExpenseType, MonthlyExpenseType } from "@/types";

export const getMonthlyExpenseTypes = async (
  userId: string,
  monthYearId: string,
): Promise<MonthlyExpenseType[]> => {
  const monthlyExpenseTypeCollectionRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.monthlyExpenseType,
  );

  const monthlyExpenseTypeSnaps = await getDocs(
    query(monthlyExpenseTypeCollectionRef, orderBy("name", "asc")),
  );
  const monthlyExpenseTypes = getSnapsData(monthlyExpenseTypeSnaps);

  return monthlyExpenseTypes;
};

export interface ExpenseTypeChanged {
  overall: boolean;
  name: boolean;
  limit: boolean;
}

export interface EditExpenseTypePayload extends ExpenseType {
  initLimit: number;
}

export const editExpenseType = async (
  userId: string,
  monthYearId: string,
  expenseType: EditExpenseTypePayload,
  changed: ExpenseTypeChanged,
) => {
  const expenseTypeRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.expenseType,
    expenseType.id,
  );
  const monthlyExpenseTypeRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.monthlyExpenseType,
    expenseType.id,
  );

  const payload = {
    name: expenseType.name,
    limit: expenseType.limit,
  };

  await updateDoc(expenseTypeRef, payload);
  await updateDoc(monthlyExpenseTypeRef, payload);

  if (changed.limit) {
    const diff = expenseType.limit - expenseType.initLimit;

    const monthYearRef = doc(
      db,
      DB_COLLECTIONS.Users,
      userId,
      DB_COLLECTIONS.monthYear,
      monthYearId,
    );

    await updateDoc(monthYearRef, {
      limit: increment(diff),
    });
  }
};
