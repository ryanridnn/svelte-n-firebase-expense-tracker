import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/";
import { DB_COLLECTIONS } from "@/const";
import { getSnapsData } from "@/firebase/helpers";
import type { ExpenseType, MonthlyExpenseType } from "@/types";
import _ from "lodash";

export const getExpenseTypes = async (userId: string) => {
  const expenseTypesRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.expenseType,
  );

  const expenseTypeSnaps = await getDocs(expenseTypesRef);

  const expenseTypes = (await getSnapsData(expenseTypeSnaps)) as ExpenseType[];

  return expenseTypes;
};

interface ExpenseTypePayload extends Omit<MonthlyExpenseType, "id"> {}

export const createNewExpenseType = async (
  userId: string,
  monthYearId: string,
  expenseTypePayload: ExpenseTypePayload,
): Promise<ExpenseType> => {
  const expenseTypeCollectionRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.expenseType,
  );

  const newExpenseTypeSnap = await addDoc(
    expenseTypeCollectionRef,
    _.omit(expenseTypePayload, "amount"),
  );

  const monthlyExpenseTypeRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
    DB_COLLECTIONS.monthlyExpenseType,
    newExpenseTypeSnap.id,
  );

  await setDoc(monthlyExpenseTypeRef, expenseTypePayload);

  const monthYearRef = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.monthYear,
    monthYearId,
  );

  await updateDoc(monthYearRef, {
    limit: increment(expenseTypePayload.limit),
  });

  return {
    id: newExpenseTypeSnap.id,
    ...expenseTypePayload,
  };
};
