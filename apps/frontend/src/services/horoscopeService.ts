import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface PlanetPlacement {
  name: string;
  house: number;
  degree?: number;
  sign?: string;
  nakshatra?: string;
  nakshatraLord?: string;
  signLord?: string;
  isRetrograde?: boolean;
}

export interface ChartData {
  rasi: PlanetPlacement[];
  navamsa: PlanetPlacement[];
  // Add other divisional charts if needed
}

export interface Horoscope {
  id?: string;
  userId: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string;  // HH:MM
  birthPlace: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  chartData: ChartData;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastAccessed?: Timestamp;
}

// Save a new horoscope
export const saveHoroscope = async (
  horoscopeData: Omit<Horoscope, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed' | 'chartData'>,
  chartData: ChartData
): Promise<Horoscope> => {
  try {
    const docRef = await addDoc(collection(db, 'horoscopes'), {
      ...horoscopeData,
      chartData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastAccessed: serverTimestamp()
    });
    
    return { 
      id: docRef.id, 
      ...horoscopeData, 
      chartData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastAccessed: Timestamp.now()
    };
  } catch (error) {
    console.error('Error saving horoscope:', error);
    throw new Error('Failed to save horoscope');
  }
};

// Get a horoscope by ID
export const getHoroscope = async (horoscopeId: string): Promise<Horoscope> => {
  try {
    const docRef = doc(db, 'horoscopes', horoscopeId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Horoscope not found');
    }

    // Update last accessed time
    await updateDoc(docRef, {
      lastAccessed: serverTimestamp()
    });

    return { id: docSnap.id, ...docSnap.data() } as Horoscope;
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    throw new Error('Failed to fetch horoscope');
  }
};

// Find horoscopes by user ID
export const findHoroscopesByUser = async (userId: string): Promise<Horoscope[]> => {
  try {
    const q = query(
      collection(db, 'horoscopes'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Horoscope[];
  } catch (error) {
    console.error('Error finding horoscopes:', error);
    throw new Error('Failed to find horoscopes');
  }
};

// Update a horoscope
export const updateHoroscope = async (
  horoscopeId: string, 
  updates: Partial<Omit<Horoscope, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'horoscopes', horoscopeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating horoscope:', error);
    throw new Error('Failed to update horoscope');
  }
};
