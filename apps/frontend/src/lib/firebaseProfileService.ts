// WARNING: Never import from this file in firebase.ts to avoid circular dependencies.
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const saveProfile = async (data: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, "profiles", user.uid);
  await setDoc(docRef, { ...data, updatedAt: new Date() });
};

export const loadProfile = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};
