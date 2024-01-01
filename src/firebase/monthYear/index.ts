import _ from "lodash";
import moment from "moment";
import { DB_COLLECTIONS } from "@/const";
import { db } from "@/firebase";
import {
  getMonthName,
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

const months = moment.months();

export const getMonthYear = async (
  userId: string,
  month: number,
  year: number,
): Promise<MonthYear> => {
  const monthName = getMonthName(month);

  const id = moment(`${monthName}-${year}`, "MMMM-YYYY")
    .format("MMM-YYYY")
    .toLowerCase();

  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    id,
  );

  const snap = await getDoc(monthYearRef);

  const currentMonth = moment().month();
  const currentYear = moment().year();

  if (snap.exists()) {
    return getSnapData(snap) as MonthYear;
  } else if (month < currentMonth && year <= currentYear) {
    return {
      id,
      amount: 0,
      limit: 0,
      month: monthName,
      year,
      notExist: true,
    };
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
      id: expenseType.id,
      name: expenseType.name,
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
    const monthlyExpenseTypeRef = doc(
      db,
      DB_COLLECTIONS.Users,
      userId,
      DB_COLLECTIONS.monthYear,
      id,
      DB_COLLECTIONS.monthlyExpenseType,
      expenseType.id,
    );

    await setDoc(monthlyExpenseTypeRef, _.omit(expenseType, "id"));
  });

  await Promise.all(promises);

  return {
    id,
    ...newMonthYear,
  } as MonthYear;
};
