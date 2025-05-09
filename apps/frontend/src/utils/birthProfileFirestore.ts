import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const fetchBirthProfile = async (uid: string) => {
  const docRef = doc(db, 'users', uid, 'birthProfile', 'profile');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveBirthProfile = async (uid: string, data: any) => {
  const docRef = doc(db, 'users', uid, 'birthProfile', 'profile');
  await setDoc(docRef, data);
};
