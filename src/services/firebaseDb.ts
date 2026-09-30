import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  writeBatch,
  query,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Menyimpan atau memperbarui dokumen di Firestore
 */
export async function fsSetDoc(colName: string, docId: string, data: any): Promise<boolean> {
  try {
    // Sanitasi data agar tidak ada undefined yang ditolak Firestore
    const cleanData = JSON.parse(JSON.stringify(data));
    const ref = doc(db, colName, docId);
    await setDoc(ref, cleanData, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase] Gagal menyimpan ke ${colName}/${docId}:`, err);
    throw err;
  }
}

/**
 * Mengambil satu dokumen dari Firestore
 */
export async function fsGetDoc<T>(colName: string, docId: string): Promise<T | null> {
  try {
    const ref = doc(db, colName, docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (err) {
    console.warn(`[Firebase] Gagal membaca dari ${colName}/${docId}:`, err);
    return null;
  }
}

/**
 * Mengambil seluruh dokumen dari sebuah koleksi di Firestore
 */
export async function fsGetCollection<T>(colName: string): Promise<T[] | null> {
  try {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as T);
    }
    return null;
  } catch (err) {
    console.warn(`[Firebase] Gagal membaca koleksi ${colName}:`, err);
    return null;
  }
}

/**
 * Mendengarkan perubahan data secara realtime (multi-device listener)
 */
export function subscribeToCollection<T>(colName: string, callback: (items: T[]) => void): Unsubscribe {
  try {
    const colRef = collection(db, colName);
    return onSnapshot(
      colRef,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as T);
        callback(items);
      },
      (err) => {
        console.warn(`[Firebase] Realtime listener error pada koleksi ${colName}:`, err);
      }
    );
  } catch (err) {
    console.warn(`[Firebase] Gagal pasang realtime listener ${colName}:`, err);
    return () => {};
  }
}

/**
 * Menghapus satu dokumen dari Firestore
 */
export async function fsDeleteDoc(colName: string, docId: string): Promise<void> {
  try {
    const ref = doc(db, colName, docId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn(`[Firebase] Gagal menghapus ${colName}/${docId}:`, err);
  }
}

/**
 * Simpan kumpulan data dokumen secara batch ke Firestore
 */
export async function fsBatchSet(colName: string, items: Array<{ id: string; data: any }>): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const item of items) {
      const cleanData = JSON.parse(JSON.stringify(item.data));
      const ref = doc(db, colName, item.id);
      batch.set(ref, cleanData, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn(`[Firebase] Gagal batch set koleksi ${colName}:`, err);
  }
}

/**
 * Cek status konektivitas Firebase Firestore
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const colRef = collection(db, 'system_health');
    const q = query(colRef, limit(1));
    await getDocs(q);
    return true;
  } catch (err) {
    console.warn('[Firebase] Ping Firestore gagal atau offline:', err);
    return false;
  }
}
