import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // Ensure `firebase.ts` is correctly configured

export const saveProfile = async (data: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const ref = doc(db, "profiles", user.uid);
  await setDoc(ref, { ...data, updatedAt: new Date() });
  return true;
};

export const loadProfile = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};
