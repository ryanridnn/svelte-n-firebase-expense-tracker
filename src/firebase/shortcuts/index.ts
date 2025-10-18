import type { Expense, Shortcut } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "..";
import { DB_COLLECTIONS } from "@/const";

export interface ShortcutPayload
  extends Omit<Expense, "id" | "createdAt" | "normalizedDate"> {
  name: string;
}

export const getShortcuts = async (userId: string) => {
  const ref = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.shortcut,
  );

  const shortcuts = await getDocs(ref);

  return shortcuts.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Shortcut,
  );
};

export const createNewShortcut = async (
  userId: string,
  payload: ShortcutPayload,
) => {
  const shortcutRef = collection(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.shortcut,
  );

  const createdAt = serverTimestamp();

  const newShorcutSnap = await addDoc(shortcutRef, {
    ...payload,
    createdAt,
  });

  return {
    id: newShorcutSnap.id,
    ...payload,
    createdAt: new Date().toISOString(),
  } as Shortcut;
};

export const deleteShortcut = async (userId: string, shortcutId: string) => {
  const ref = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.shortcut,
    shortcutId,
  );

  await deleteDoc(ref);
};

export const updateShortcut = async (
  userId: string,
  shortcutId: string,
  shortcut: Omit<Shortcut, "id" | "createdAt" | "updatedAt">,
) => {
  const ref = doc(
    db,
    DB_COLLECTIONS.Users,
    userId,
    DB_COLLECTIONS.shortcut,
    shortcutId,
  );

  await updateDoc(ref, {
    ...shortcut,
    updatedAt: serverTimestamp(),
  });
};
