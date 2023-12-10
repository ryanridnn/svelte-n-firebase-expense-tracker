import { DB_COLLECTIONS } from "@/const";
import { db } from "@/firebase";
import {
  getMonthYearData,
  getSnapData,
  getSnapsData,
} from "@/firebase/helpers";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { MonthYear, ExpenseType } from "@/types";
import _ from "lodash";

export const getMonthYear = async (
  userId: string,
  id: string,
): Promise<MonthYear> => {
  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    id,
  );

  const snap = await getDoc(monthYearRef);

  if (snap.exists()) {
    return getSnapData(snap) as MonthYear;
  } else {
    return createMonthYear(userId, id);
  }
};

const createMonthYear = async (userId: string, id: string) => {
  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    id,
  );

  const expenseTypesRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.expenseType,
  );
  const expenseTypeSnaps = await getDocs(expenseTypesRef);
  let expenseTypes = getSnapsData(expenseTypeSnaps);
  expenseTypes = expenseTypes.map((expenseType: any) => {
    return {
      ref: expenseType.id,
      limit: expenseType.limit,
      amount: 0,
    };
  });

  const totalLimit =
    expenseTypes.length > 0
      ? expenseTypes
          .map((expenseType: any) => expenseType.limit)
          .reduce((prev: number, next: number) => prev + next)
      : 0;

  const monthYearData = getMonthYearData();

  const newMonthYear = {
    month: monthYearData.month,
    year: monthYearData.year,
    amount: 0,
    limit: totalLimit,
  };

  const newMonthYearSnap = await setDoc(monthYearRef, newMonthYear);

  const promises = expenseTypes.map(async (expenseType: any) => {
    await addDoc(expenseTypesRef, expenseType);
  });

  await Promise.all(promises);

  return {
    id,
    ...newMonthYear,
  } as MonthYear;
};
