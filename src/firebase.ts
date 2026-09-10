import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Equipment, EquipmentStatus } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Connect to specified Firestore database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const EQUIPMENTS_COLLECTION = 'equipments';

/**
 * Add a new equipment record to Firestore
 */
export async function createEquipment(equipment: Omit<Equipment, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, EQUIPMENTS_COLLECTION), {
    ...equipment,
    serverCreatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Find equipment by unique series number (e.g. INV.AE001.260909)
 */
export async function getEquipmentBySeries(seriesNumber: string): Promise<Equipment | null> {
  const cleanCode = seriesNumber.trim().toUpperCase();
  const q = query(collection(db, EQUIPMENTS_COLLECTION), where('seriesNumber', '==', cleanCode));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return {
      id: docData.id,
      ...(docData.data() as Omit<Equipment, 'id'>),
    };
  }
  return null;
}

/**
 * Real-time subscription to equipment list
 */
export function subscribeEquipments(
  onData: (items: Equipment[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, EQUIPMENTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Equipment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Equipment, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      console.warn('Firestore subscription warning:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Update equipment status and optional notes
 */
export async function updateEquipment(
  id: string,
  updates: Partial<Equipment>
): Promise<void> {
  const docRef = doc(db, EQUIPMENTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
