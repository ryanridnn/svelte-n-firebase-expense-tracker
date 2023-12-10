import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  query,
  collection,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebase/index";
import _ from "lodash";
import { DB_COLLECTIONS } from "@/const";
import { getSnapData, getSnapsData } from "@/firebase/helpers";

const provider = new GoogleAuthProvider();

interface UserProp {
  name: string;
  email: string;
  avatar: string | null;
  gid: string;
}

const usersRef = collection(db, DB_COLLECTIONS.Users);

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const {
      user: { displayName, email, photoURL, uid },
    } = result;

    if (uid && displayName && email) {
      const noUser = await checkNoUser(uid);

      const user: UserProp = {
        name: displayName,
        email,
        avatar: photoURL,
        gid: uid,
      };

      if (noUser) {
        await createUser(user);
      }
    }
  } catch (e) {}
};

export const logOut = async () => {
  try {
    await signOut(auth);

    return true;
  } catch (e) {
    return false;
  }
};

export const checkNoUser = async (gid: string) => {
  // const user = await findUserWithGID(gid);
  // return !user;
  const snap = await getDoc(doc(db, DB_COLLECTIONS.Users, gid));

  return !snap.exists();
};

export const findUserById = async (id: string) => {
  const userRef = doc(db, DB_COLLECTIONS.Users, id);
  const snap = await getDoc(userRef);

  const user = getSnapData(snap);

  return user || null;
};

export const createUser = async (user: UserProp) => {
  const ref = doc(db, DB_COLLECTIONS.Users, user.gid);

  const omitted = _.omit(user, "gid");
  await setDoc(ref, omitted);
  // await setDoc(usersRef, user);
};
