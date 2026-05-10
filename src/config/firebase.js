import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyATr7fH7_f5WvoEp38rigLNz3D6LKhb4n4",
  authDomain: "shinex-accba.firebaseapp.com",
  projectId: "shinex-accba",
  storageBucket: "shinex-accba.firebasestorage.app",
  messagingSenderId: "812988087177",
  appId: "1:812988087177:web:d35b432c14b41f96187f58",
  measurementId: "G-4J2B8R6JCK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
