import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { DB_COLLECTIONS } from "@/const";
import { getSnapsData } from "@/firebase/helpers";
import type { MonthlyExpenseType } from "@/types";

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
