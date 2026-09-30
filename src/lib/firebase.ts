import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyA4D8vQMGQmVubXQ5fnz25-LLhPUiyP76U",
  authDomain: "fixlolosptn.firebaseapp.com",
  projectId: "fixlolosptn",
  storageBucket: "fixlolosptn.firebasestorage.app",
  messagingSenderId: "873088794973",
  appId: "1:873088794973:web:6b078a511b8ca0a12e68b4"
};

// Inisialisasi Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Inisialisasi Firestore dengan auto-detect long polling agar stabil di HP & Laptop lintas jaringan
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

export default app;
