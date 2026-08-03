import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Public web config — safe to expose client-side. Used only for Firebase
// Auth (admin login) now; Firestore reads/writes all go through the ShineX
// API's Admin SDK instead (see server/), which is why `firebase/firestore`
// isn't imported here anymore.
const firebaseConfig = {
  apiKey: "AIzaSyDSPTY9AYEKbz9-A3_NXWWiUpY51lVh-ak",
  authDomain: "shinex-e3f7d.firebaseapp.com",
  projectId: "shinex-e3f7d",
  storageBucket: "shinex-e3f7d.firebasestorage.app",
  messagingSenderId: "288966539610",
  appId: "1:288966539610:web:4b3632127f1a90c0d6db63",
  measurementId: "G-6EGT4JW8YP",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
