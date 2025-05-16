import { db } from '../../firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  writeBatch,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

export interface TopicVersionFirestore {
  content: string;
  confidence?: number;
  editedBy?: string;
  timestamp: string; // ISO 8601
  source?: 'AI' | 'Astrologer';
}

// Add a new version (with auto-prune to max 25)
export async function logTopicVersion({
  userId,
  horoscopeId,
  topicKey,
  data,
}: {
  userId: string;
  horoscopeId: string;
  topicKey: string;
  data: TopicVersionFirestore;
}) {
  const versionsCol = collection(db, `users/${userId}/horoscopes/${horoscopeId}/topics/${topicKey}/versions`);
  // Add new version
  await addDoc(versionsCol, data);
  // Prune to last 25
  const q = query(versionsCol, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  if (snap.size > 25) {
    const batch = writeBatch(db);
    snap.docs.slice(25).forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }
}

// Fetch all versions (latest first)
export async function fetchTopicVersions({
  userId,
  horoscopeId,
  topicKey,
}: {
  userId: string;
  horoscopeId: string;
  topicKey: string;
}): Promise<(TopicVersionFirestore & { id: string })[]> {
  const versionsCol = collection(db, `users/${userId}/horoscopes/${horoscopeId}/topics/${topicKey}/versions`);
  const q = query(versionsCol, orderBy('timestamp', 'desc'), limit(25));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as any;
}

// Restore a version (write to main topic doc)
export async function restoreTopicVersion({
  userId,
  horoscopeId,
  topicKey,
  version,
}: {
  userId: string;
  horoscopeId: string;
  topicKey: string;
  version: TopicVersionFirestore;
}) {
  const topicDoc = doc(db, `users/${userId}/horoscopes/${horoscopeId}/topics`, 'all');
  await setDoc(
    topicDoc,
    {
      [topicKey]: {
        content: version.content,
        confidence: version.confidence,
        confidenceSource: version.source,
        lastEditedBy: version.editedBy,
      },
    },
    { merge: true }
  );
}
